// c:\Users\Israel\Desktop\‏‏תיקיה חדשה\לימודים\לימודים ערן\Shopping_App\server-app\src\auth\guards\jwt-auth.guard.ts

import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {}
