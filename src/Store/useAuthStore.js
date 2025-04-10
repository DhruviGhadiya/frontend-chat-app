import axios from "axios";
import toast from "react-hot-toast";
import { Navigate } from "react-router-dom";
import Cookies from 'js-cookie';
import { create } from "zustand";
import { io } from "socket.io-client";
import { jwtDecode } from "jwt-decode";

// const BASE_URL=import.meta.env.MODE === "development" ? import.meta.env.VITE_API_BASE_URL : "/api"
const BASE_URL=import.meta.env.VITE_API_BASE_URL;

export const useAuthStore = create((set, get) => ({
    authUser: null,
    userId: null,
    isSigningUp: false,
    isLoging: false,
    isUpadatingProfile: false,
    isCheckingAuth: true,
    onlineUsers: [],
    socket: null,

    // checkAuth: async () => {
    //     try {
    //         // const res = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/auth/check-auth`);
    //         const res = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/auth/check`);
    //         console.log(res);
    //         set({ authUser: res.data });
    //     }
    //     catch (error) {
    //         console.log(error);

    //     }
    //     finally {
    //         set({ isCheckingAuth: false })
    //     }
    // },

    checkAuth: async () => {
        try {
            const token = Cookies.get('token');
            if (token &&  token !== "undefined") {
                const decode = jwtDecode(token);
                const userData = decode.userData;
                // console.log("decode userdata:",userData);
                set({ userId: userData._id })
                set({ authUser: token })
                get().connectSocket();

               

                // if (get().authUser && typeof get().authUser === "string") {
                //     const decode = jwtDecode(authUser);
                //     const userData = decode.userData;
                //     set({ userId: userData._id })
                // }
            }

        }
        catch (error) {
            console.log(error);
        }
        finally {
            set({ isCheckingAuth: false })
        }
    },


    signup: async (data) => {
        set({ isSigningUp: true });
        try {
            const res = await axios.post(`${BASE_URL}/auth/signup`, data, { withCredentials: true });

            if (res.status === 200) {
                toast.success("Account created successfully");
                set({ authUser: res.data })
                get().connectSocket();
            }
        } catch (error) {
            console.log(error);
        }
        finally {
            set({ isSigningUp: false })
        }
    },

    login: async (data) => {
        set({ isLoging: true });
        try {
            const res = await axios.post(`${BASE_URL}/auth/login`, data, { withCredentials: true });

            if (res.status === 200) {
                Cookies.set('token', res.data.token, { expires: 7 });
                set({ authUser: res.data.token });
                toast.success("Logged in successfully");
                get().connectSocket();
            }
        } catch (error) {
            // toast.error(error);
            console.log(error);

        } finally {
            set({ isLoging: false });
        }
    },

    // logout: async () => {
    //     try {
    //         await axios.post(`${import.meta.env.VITE_API_BASE_URL}/auth/logout`);
    //         set({ authUser: null })
    //         toast.success("Logged out successfully");
    //     }
    //     catch (error) {
    //         toast.error(error.response.data.message);
    //     }
    // }
    logout: () => {
        Cookies.remove('token', { path: "/" });
        set({ authUser: null })
        toast.success("Logged out successfully");
        get().disconnectSocket();
    },

    updateProfile: async (data) => {
        set({ isUpadatingProfile: true })
        try {
            const token = Cookies.get("token");
            const res = await axios.put(`${BASE_URL}/auth/update-profile`,
                data,
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                })
            if (res.status === 200) {
                Cookies.set('token', res.data.token, { expires: 7 });
                set({ authUser: res.data.token });
                // toast.success("updated  successfully");
            }
            return res;
        } catch (error) {
            console.log(error);
        }
        finally {
            set({ isUpadatingProfile: false })
        }
    },
    connectSocket: () => {
        const { authUser,userId } = get();
        if (!authUser || get().socket?.connected) return;
        const socket = io("http://localhost:5001", {
            query: {
                userId: userId,
            }
        });
        socket.connect();
        set({ socket: socket });
        socket.on("getOnlineUsers", (userIds) => {
            set({ onlineUsers: userIds });
        })
    },
    disconnectSocket: () => {
        if (get().socket?.connected) get().socket.disconnect();
    },
}))