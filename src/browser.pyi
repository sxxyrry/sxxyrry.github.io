from typing import Any, Callable

class DOMEvent:
    type: str
    target: 'DOMElement'
    currentTarget: 'DOMElement'
    preventDefault: Callable[[], None]
    stopPropagation: Callable[[], None]

class DOMElement:
    id: str
    className: str
    style: dict[str, str]
    innerHTML: str
    innerText: str
    children: list['DOMElement']
    parentElement: 'DOMElement | None'
    nextSibling: 'DOMElement | None'
    previousSibling: 'DOMElement | None'

    def __init__(self, tag: str, attributes: 'dict[str, Any] | None' = None) -> None:
        ...

    def append(self, child: 'DOMElement') -> None:
        ...

    def remove(self) -> None:
        ...

    def addEventListener(self, event_type: str, handler: Callable[['DOMEvent'], None]) -> None:
        ...

    def removeEventListener(self, event_type: str, handler: Callable[['DOMEvent'], None]) -> None:
        ...

    def getBoundingClientRect(self) -> dict[str, float]:
        ...

    def setAttribute(self, name: str, value: Any) -> None:
        ...

    def getAttribute(self, name: str) -> Any:
        ...

    def removeAttribute(self, name: str) -> None:
        ...

    def querySelector(self, selectors: str) -> 'DOMElement | None':
        ...

    def querySelectorAll(self, selectors: str) -> list['DOMElement']:
        ...

class Window:
    document: 'Document'
    location: 'Location'
    setTimeout: Callable[[Callable[[], None], int], None]
    clearTimeout: Callable[[int], None]
    setInterval: Callable[[Callable[[], None], int], None]
    clearInterval: Callable[[int], None]
    addEventListener: Callable[[str, Callable[['DOMEvent'], None]], None]
    removeEventListener: Callable[[str, Callable[['DOMEvent'], None]], None]

class Location:
    href: str
    protocol: str
    host: str
    hostname: str
    port: str
    pathname: str
    search: str
    hash: str
    reload: Callable[[], None]
    assign: Callable[[str], None]
    replace: Callable[[str], None]

class Document:
    body: DOMElement
    head: DOMElement
    title: str
    cookie: str

    def __init__(self) -> None:
        ...

    def getElementById(self, id: str) -> 'DOMElement | None':
        ...

    def getElementsByClassName(self, class_name: str) -> list[DOMElement]:
        ...

    def getElementsByTagName(self, tag_name: str) -> list[DOMElement]:
        ...

    def getElementsByName(self, name: str) -> list[DOMElement]:
        ...

    def querySelector(self, selectors: str) -> 'DOMElement | None':
        ...

    def querySelectorAll(self, selectors: str) -> list[DOMElement]:
        ...

    def createElement(self, tag: str) -> DOMElement:
        ...

    def createTextNode(self, data: str) -> DOMElement:
        ...

    def createComment(self, data: str) -> DOMElement:
        ...

    def createDocumentFragment(self) -> DOMElement:
        ...

    def addEventListener(self, event_type: str, handler: Callable[['DOMEvent'], None]) -> None:
        ...

    def removeEventListener(self, event_type: str, handler: Callable[['DOMEvent'], None]) -> None:
        ...

# 全局变量
document: Document
window: Window