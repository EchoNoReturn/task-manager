import { HttpStatus } from '@nestjs/common';
import { BusinessException } from '../../common/exceptions';

export class FileSizeExceededException extends BusinessException {
  constructor(maxSize: number) {
    super(
      `文件大小超出限制，最大允许 ${Math.round(maxSize / 1024 / 1024)}MB`,
      HttpStatus.PAYLOAD_TOO_LARGE,
    );
  }
}

export class InvalidFileTypeException extends BusinessException {
  constructor(allowedTypes: string[]) {
    super(
      `不支持的文件类型，允许的类型：${allowedTypes.join(', ')}`,
      HttpStatus.UNSUPPORTED_MEDIA_TYPE,
    );
  }
}
