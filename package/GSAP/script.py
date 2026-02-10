import requests
from html.parser import HTMLParser
import socket
import ssl
from concurrent.futures import ThreadPoolExecutor, as_completed
import time
import os
from urllib.parse import urljoin

# 创建自定义适配器以处理SSL问题
session = requests.Session()

# 添加更全面的headers
headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
    'Accept-Language': 'en-US,en;q=0.5',
    'Accept-Encoding': 'gzip, deflate',
    'DNT': '1',
    'Connection': 'keep-alive',
    'Upgrade-Insecure-Requests': '1',
    'Sec-Fetch-Dest': 'document',
    'Sec-Fetch-Mode': 'navigate',
    'Sec-Fetch-Site': 'none',
    'Sec-Fetch-User': '?1',
    'Cache-Control': 'max-age=0',
}

class TbodyLinkParser(HTMLParser):
    def __init__(self):
        super().__init__()
        self.in_tbody = 0
        self.links = []
        
    def handle_starttag(self, tag, attrs):
        tag = tag.lower()
        if tag == 'tbody':
            self.in_tbody += 1
        elif tag == 'a' and self.in_tbody > 0:
            attrs_dict = dict(attrs)
            if 'href' in attrs_dict:
                self.links.append(attrs_dict['href'])
        
    def handle_endtag(self, tag):
        if tag.lower() == 'tbody' and self.in_tbody > 0:
            self.in_tbody -= 1

def download_file(url, filename, retries=3):
    """下载单个文件"""
    for attempt in range(retries):
        try:
            # 使用session保持连接
            response = session.get(url, headers=headers, timeout=10)
            response.raise_for_status()
            
            # 确保目录存在
            os.makedirs(os.path.dirname(filename), exist_ok=True)
            
            # 写入文件
            with open(filename, 'w', encoding='utf-8') as f:
                f.write(response.text)
            
            return True, filename, len(response.text)
        except Exception as e:
            if attempt < retries - 1:
                time.sleep(1)  # 等待1秒后重试
                continue
            return False, filename, str(e)
    
    return False, filename, "Max retries exceeded"

def download_files_multithreaded(links, base_url, max_workers=5):
    """多线程下载文件"""
    # 过滤掉目录链接和非目标文件
    download_tasks = []
    
    for link in links:
        if link.endswith('/'):  # 跳过目录
            continue
        
        # 构建完整的URL
        full_url = urljoin('https://cdn.jsdelivr.net', link)
        
        # 提取文件名
        filename = link.split('/')[-1]
        save_path = f'./code/{filename}'
        
        download_tasks.append((full_url, save_path))
    
    print(f"准备下载 {len(download_tasks)} 个文件，使用 {max_workers} 个线程...")
    
    success_count = 0
    total_size = 0
    failed_files = []
    
    # 使用线程池执行下载任务
    with ThreadPoolExecutor(max_workers=max_workers) as executor:
        # 提交所有任务
        future_to_file = {
            executor.submit(download_file, url, path): (url, path) 
            for url, path in download_tasks
        }
        
        # 处理完成的任务
        for i, future in enumerate(as_completed(future_to_file), 1):
            url, path = future_to_file[future]
            
            try:
                success, filename, result = future.result()
                
                if success:
                    success_count += 1
                    total_size += result  # result是文件大小
                    print(f"✓ [{i}/{len(download_tasks)}] 成功: {filename} ({result} bytes)")
                else:
                    failed_files.append((filename, result))
                    print(f"✗ [{i}/{len(download_tasks)}] 失败: {filename} - {result}")
                    
            except Exception as e:
                failed_files.append((path, str(e)))
                print(f"✗ [{i}/{len(download_tasks)}] 异常: {path} - {e}")
    
    return success_count, total_size, failed_files

def main():
    try:
        url = 'https://cdn.jsdelivr.net/npm/gsap@3.14.2/dist/'
        
        # 先获取目录页面
        html_content = None
        for verify_ssl in [True, False]:
            try:
                print(f"尝试连接主页面 (SSL验证: {verify_ssl})...")
                response = session.get(
                    url, 
                    headers=headers, 
                    timeout=15,
                    verify=verify_ssl,
                    allow_redirects=True
                )
                response.raise_for_status()
                
                print("连接成功！状态码:", response.status_code)
                html_content = response.text
                break
                
            except requests.exceptions.SSLError as e:
                print(f"SSL错误: {e}")
                continue
            except Exception as e:
                print(f"连接失败: {e}")
                continue
        
        if not html_content:
            print("无法获取目录页面")
            return
        
        print("内容长度:", len(html_content))
        
        # 解析链接
        parser = TbodyLinkParser()
        parser.feed(html_content)
        
        print(f"找到 {len(parser.links)} 个链接")
        
        # 显示找到的链接
        print("\n找到的文件链接:")
        for i, link in enumerate(parser.links, 1):
            if not link.endswith('/'):  # 只显示文件
                print(f"  {i:3}. {link}")
        
        # 确认是否继续下载
        choice = input(f"\n是否开始下载 {len([l for l in parser.links if not l.endswith('/')])} 个文件? (y/n): ")
        if choice.lower() != 'y':
            print("取消下载")
            return
        
        # 多线程下载
        start_time = time.time()
        success_count, total_size, failed_files = download_files_multithreaded(
            parser.links, 
            url,
            max_workers=10  # 可以根据需要调整线程数
        )
        end_time = time.time()
        
        # 输出结果
        print("\n" + "="*50)
        print("下载完成!")
        print(f"总耗时: {end_time - start_time:.2f} 秒")
        print(f"成功: {success_count} 个文件")
        print(f"失败: {len(failed_files)} 个文件")
        print(f"总大小: {total_size:,} bytes")
        
        if failed_files:
            print("\n失败的文件:")
            for filename, error in failed_files:
                print(f"  {filename}: {error}")
        
    except KeyboardInterrupt:
        print("\n用户中断")
    except Exception as e:
        print(f"发生错误: {e}")

if __name__ == "__main__":
    main()