import { HttpException, HttpStatus } from '@nestjs/common';

export class BusinessException extends HttpException {
  constructor(message: string, statusCode: HttpStatus = HttpStatus.BAD_REQUEST) {
    super(message, statusCode);
  }
}

export class NotFoundException extends BusinessException {
  constructor(entity: string, id: string) {
    super(`${entity} [${id}] 不存在`, HttpStatus.NOT_FOUND);
  }
}

export class ForbiddenException extends BusinessException {
  constructor(message = '无权执行此操作') {
    super(message, HttpStatus.FORBIDDEN);
  }
}

export class UnauthorizedException extends BusinessException {
  constructor(message = '未登录或 token 已过期') {
    super(message, HttpStatus.UNAUTHORIZED);
  }
}
