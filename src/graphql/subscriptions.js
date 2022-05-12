/* eslint-disable */
// this is an auto generated file. This will be overwritten

export const onCreateSong = /* GraphQL */ `
  subscription OnCreateSong($owner: String) {
    onCreateSong(owner: $owner) {
      id
      title
      description
      filePath
      like
      owner
      createdAt
      updatedAt
    }
  }
`;
export const onUpdateSong = /* GraphQL */ `
  subscription OnUpdateSong($owner: String) {
    onUpdateSong(owner: $owner) {
      id
      title
      description
      filePath
      like
      owner
      createdAt
      updatedAt
    }
  }
`;
export const onDeleteSong = /* GraphQL */ `
  subscription OnDeleteSong($owner: String) {
    onDeleteSong(owner: $owner) {
      id
      title
      description
      filePath
      like
      owner
      createdAt
      updatedAt
    }
  }
`;
