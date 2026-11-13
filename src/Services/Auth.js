import { request, setToken } from "./Client";

export const register = async( username, email, password ) => {
    const data = await request("/api/auth/register", {
        method: "POST",
        body: { username, email, password },
    });
    setToken(data.token);
    return data;
}

export const login = async( email, password ) => {
    const data = await request("/api/auth/login", {
        method: "POST",
        body: { email, password },
    });
    setToken(data.token);
    return data;
}

export const getMe = () => {
    return request("/api/users/me")
}

export const changePassword = (currentPassword, NewPassword) => {
    return request("/api/auth/change-password", {
        method: "POST",
        body: { currentPassword, NewPassword}
    })
}