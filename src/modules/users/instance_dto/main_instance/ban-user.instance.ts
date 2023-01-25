export class BanUserMain {
  isBanned: boolean;
  banReason: string;
}
export class BanBlogMain extends BanUserMain {
  blogId: string;
}
