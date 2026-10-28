from typing import Any, List, Optional


class AppException(Exception):
    """Base application exception for standardized error envelopes."""

    def __init__(
        self,
        code: str,
        message: str,
        status_code: int = 400,
        details: Optional[List[Any]] = None,
    ):
        self.code = code
        self.message = message
        self.status_code = status_code
        self.details = details or []
        super().__init__(self.message)


class InvalidCSVHeaderError(AppException):
    def __init__(self, message: str, details: Optional[List[Any]] = None):
        super().__init__(
            code="INVALID_CSV_HEADER",
            message=message,
            status_code=400,
            details=details,
        )


class DataParseError(AppException):
    def __init__(self, message: str, details: Optional[List[Any]] = None):
        super().__init__(
            code="DATA_PARSE_ERROR",
            message=message,
            status_code=400,
            details=details,
        )


class SourceNotFoundError(AppException):
    def __init__(self, message: str, details: Optional[List[Any]] = None):
        super().__init__(
            code="SOURCE_NOT_FOUND",
            message=message,
            status_code=404,
            details=details,
        )


class NoDatasetError(AppException):
    def __init__(self, message: str = "No dataset has been uploaded yet.", details: Optional[List[Any]] = None):
        super().__init__(
            code="DATA_PARSE_ERROR",
            message=message,
            status_code=404,
            details=details,
        )


class ZeroDivisionCalculationError(AppException):
    def __init__(self, message: str, details: Optional[List[Any]] = None):
        super().__init__(
            code="ZERO_DIVISION_ERROR",
            message=message,
            status_code=400,
            details=details,
        )
