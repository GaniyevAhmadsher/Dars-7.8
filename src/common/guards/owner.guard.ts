// src/common/guards/owner.guard.ts
import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { PostsService } from '../../modules/posts/posts.service';
import { UserRole } from '../../modules/users/entities/user.entity';

@Injectable()
export class OwnerGuard implements CanActivate {
  constructor(private postsService: PostsService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    const postId = +request.params.id;

    if (!postId) {
      throw new NotFoundException('Post ID not provided');
    }

    const post = await this.postsService.findOne(postId);

    if (!post) {
      throw new NotFoundException(`Post with ID ${postId} not found`);
    }

    // Admin can edit/delete any post
    if (user.role === UserRole.ADMIN) {
      return true;
    }

    // Regular users can only edit/delete their own posts
    if (post.authorId !== user.id) {
      throw new ForbiddenException(
        'You are not authorized to modify this post',
      );
    }

    return true;
  }
}
