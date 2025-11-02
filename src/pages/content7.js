import { IUser } from "modules/UserList/types/user";

// the function of searching for the necessary users and highlighting the text from the search with color

export const filterUsers = (value: string, array: Array<IUser>) => {
  // if the search string is empty, no filtering is needed
  if (!value) {
    return array;
  } else {
    // looking for elements that contain the desired word from the search
    // return a new array with changed elements
    return (
      array
        .filter(
          (item) =>
            item.name.toLowerCase().includes(value.toLowerCase()) ||
            item.username.toLowerCase().includes(value.toLowerCase()) ||
            item.email.toLowerCase().includes(value.toLowerCase()),
        )
        // highlight with color (<mark/>) elements that contain the desired word from the search
        .map((item) => {
          const newName = item.name.replace(
            new RegExp(value, "gi"),
            (match: string) => `<mark>${match}</mark>`,
          );
          const newUserName = item.username.replace(
            new RegExp(value, "gi"),
            (match: string) => `<mark>${match}</mark>`,
          );
          const newEmail = item.email.replace(
            new RegExp(value, "gi"),
            (match: string) => `<mark>${match}</mark>`,
          );
          // return the changed elements back
          return {
            ...item,
            name: newName,
            username: newUserName,
            email: newEmail,
          };
        })
    );
  }
};