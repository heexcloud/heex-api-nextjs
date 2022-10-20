export type CreateCommentReturnType = {
  objectId: string;
  createdAt: string;
};

export type CommentCountReturnType = {
  result: Array<any>;
  count: number;
};

// comment can be divided into two categries:
// 1. thread, which is a comment that can have replies, it's the root of the thread
// 2. reply, which is under some thread, it's the leaf of the thread
export type CommentType = {
  username: string;
  email: string;
  pageId: string;
  comment: string;
  createdAt: string;
  updatedAt?: string;
  objectId: string;
  tid?: string; // the thread id of the comment, which is a reply per se
  rid?: string; // the id of the reply, which the reply replies to
  at?: string; // the publisher/username of the reply, which the reply replies to
};

export type CreateCommentFnType = (
  args: CommentType
) => Promise<CreateCommentReturnType & CommentCountReturnType>;

export type GetCommentsReturnType = {
  comments: Array<CommentType & { replies?: CommentType[] }>;
};

export type GetCommentCountFnType = (args: {
  pageId: string;
}) => Promise<CommentCountReturnType>;

export type GetCommentsFnType = (args: {
  pageId: string;
}) => Promise<GetCommentsReturnType>;
