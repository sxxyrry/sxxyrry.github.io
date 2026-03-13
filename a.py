from collections.abc import Callable
print('23XRStudio - 一切，皆有可能！')
# 提示：本代码来自于 1024 程序员节 的 JS 代码
F: Callable[[bool, bool, bool, bool, int], bool] = lambda a, b, c, d, t: \
  [a, b, c, d, not a, not c, not d, \
  not a and not b, not a and not c, \
  not b and not c, not a and not b \
  and not c, a or c, a or b, b or c, \
  a or b or c][t]; M='difedialcijcahihdjnkhhochkbackmffgm'; L: list[int]=list(
  map(lambda i:ord(i)-97,M))
def R(n: int) -> None:
  d: str = ''; B: list[bool]=list(map(lambda i: i == '1',
    bin(n)[2:].zfill(4)))[::-1]
  for i in range(len(M)):
    d += str(
      bool(F(*B, L[i]))  # pyright: ignore[reportUnknownArgumentType]
      and str(n) or ' ')
    d += i % 5 == 4 and '\n' or ''
  print(d)
list(map(R,map(int, str(1<< 10))))