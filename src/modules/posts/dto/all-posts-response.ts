export interface IPostsRequest {
  id: string;
  shortDescription: string;
  content: string;
  title: string;
  bloggerId: any;
  bloggerName: string;
  addedAt: Date;
  extendedLikesInfo?: {
    dislikesCount: number;
    likesCount: number;
    myStatus: statusType;
    newestLikes: { addedAt: string; userId: string; login: string }[];
  };
}
//  "id": "string",
//       "title": "string",
//       "shortDescription": "string",
//       "content": "string",
//       "blogId": "string",
//       "blogName": "string",
//       "createdAt": "2022-10-23T18:54:02.535Z",
//       "extendedLikesInfo": {
//         "likesCount": 0,
//         "dislikesCount": 0,
//         "myStatus": "None",
//         "newestLikes": [
//           {
//             "addedAt": "2022-10-23T18:54:02.535Z",
//             "userId": "string",
//             "login": "string"
//           }
//         ]
//       }
