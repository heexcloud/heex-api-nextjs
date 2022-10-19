export type CreateCommentReturnType = {
  objectId: string;
  createdAt: string;
};

export type CommentCountReturnType = {
  result: Array<any>;
  count: number;
};

export type CommentType = {
  username: string;
  email: string;
  pageId: string;
  comment: string;
  createdAt: string;
  updatedAt?: string;
  objectId: string;
};

export type GetCommentsReturnType = {
  comments: Array<CommentType>;
};

export type GetCommentCountFnType = (args: {
  pageId: string;
}) => Promise<CommentCountReturnType>;

export type GetCommentsFnType = (args: {
  pageId: string;
}) => Promise<GetCommentsReturnType>;
