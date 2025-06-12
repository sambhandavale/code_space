import axiosInstance from "../utility/axios_interceptor";

export const getAction = async (route: string, callback?: any) => {
  try {
    const res = await axiosInstance.get(route);
    if (callback) callback(res);
    return res;
  } catch (err: any) {
    if (callback) callback(err);
    return err.response;
  }
};

export const postAction = async (route: any, data: any, callback?: any) => {
  try {
    const res = await axiosInstance.post(route, data);
    if (callback) callback(res);
    return res;
  } catch (err: any) {
    if (callback) callback(err.response);
    return err.response;
  }
};

export const patchAction = async (
  route: string,
  data: Object,
  callback?: any,
) => {
  try {
    const res = await axiosInstance.patch(route, data);
    if (callback) callback(res);
    return res;
  } catch (err: any) {
    if (callback) callback(err);
    return err.response;
  }
};

export const deleteAction = async (route: string, callback?: any) => {
  try {
    const res = await axiosInstance.delete(route);
    if (callback) callback(res);
    return res;
  } catch (err: any) {
    if (callback) callback(err);
    return err.response;
  }
};

export const putAction = async (route: string, data: Object, callback?: any) => {
  try {
    const res = await axiosInstance.put(route, data);
    if (callback) callback(res);
    return res;
  } catch (err: any) {
    if (callback) callback(err);
    return err.response;
  }
};
