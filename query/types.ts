export type CreateCommentReturnType = {
  objectId: string;
  createdAt: string;
};

export type CommentCountReturnType = {
  result: Array<any>;
  count: number;
};

export type GetCommentsReturnType = any;

export type GetCommentCountFnType = (args: {
  pageId: string;
}) => Promise<CommentCountReturnType>;

export type GetCommentsFnType = (args: {
  pageId: string;
}) => Promise<GetCommentsReturnType>;
