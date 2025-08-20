import base64
from uuid import UUID

def uuid_to_b64url(u: UUID) -> str:
    # 16 байт → base64url → убрать паддинг '='
    return base64.urlsafe_b64encode(u.bytes).decode('ascii').rstrip('=')

def b64url_to_uuid(s: str) -> UUID:
    # восстановить паддинг и декодировать
    pad = '=' * (-len(s) % 4)
    raw = base64.urlsafe_b64decode(s + pad)
    if len(raw) != 16:
        raise ValueError("Invalid ref token length")
    return UUID(bytes=raw)
