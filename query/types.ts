export type CreateCommentReturnType = {
  objectId: string;
  createdAt: string;
};

export type GetAllCommentCountReturnType = {
  result: Array<any>;
  count: number;
};
