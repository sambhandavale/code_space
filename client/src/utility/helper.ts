import cookie from "js-cookie";

export const getLocalStorage = (key: string) => {
  if (window) {
    return localStorage.getItem(key);
  }
};

export const setLocalStorage = (key: string, value: string) => {
  if (window) {
    localStorage.setItem(key, JSON.stringify(value));
  }
};

export const removeLocalStorage = (key: string) => {
  if (window) {
    localStorage.removeItem(key);
  }
};

export const setcookie = (key: string, value: string) => {
  if (window) {
    cookie.set(key, value, {
      expires: 1,
    });
  }
};

export const removecookie = (key: string) => {
  if (window) {
    cookie.remove(key, {
      expires: 1,
    });
  }
};

export const getcookie = (key: string) => {
  if (window) {
    return cookie.get(key);
  }
};

export const isAuth = () => {
  if (window) {
    // console.log(localStorage.getItem("user"), getcookie("jwt"));

    if (!!localStorage.getItem("user")) {
      return JSON.parse(localStorage.getItem("user") ?? "");
    } else {
      return false;
    }
  }
};

export const authenticate = (response: { data: any }, next: any) => {
  setLocalStorage("user", response.data.user);

  const expirationDate = new Date(new Date().getTime() + 60 * 60 * 7 * 1000);
  setLocalStorage("expirationDate", expirationDate.toDateString());

  if (next) next();
};
