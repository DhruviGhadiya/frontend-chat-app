import axios from "axios";
import Cookies from 'js-cookie';
import { create } from "zustand";
import { useAuthStore } from "./useAuthStore";

// const BASE_URL=import.meta.env.MODE === "development" ? import.meta.env.VITE_API_BASE_URL : "/api"

const BASE_URL=import.meta.env.VITE_API_BASE_URL;

export const useChatStore = create((set, get) => ({
    messages: [],
    users: [],
    selectedUser: null,
    isUsersLoading: false,
    isMessagesLoading: false,


    getUsers: async () => {
        set({ isUsersLoading: true });
        try {
            const token = Cookies.get("token");
            const res = await axios.get(`${BASE_URL}/messages/users`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );
            // console.log(res);
            set({ users: res.data });
        }
        catch (error) {
            console.log(error);
        }
        finally {
            set({ isUsersLoading: false });
        }
    },

    getMessages: async (userId) => {
        set({ isMessagesLoading: true });
        try {
            const token = Cookies.get("token");
            const res = await axios.get(`${BASE_URL}/messages/chat/${userId}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );
            // console.log(res);
            set({ messages: res.data });
        }
        catch (error) {
            console.log(error);
        }
        finally {
            set({ isMessagesLoading: false });
        }
    },
    sendMessage: async (messageData) => {
        const { selectedUser, messages } = get();
        try {
            const token = Cookies.get("token");
            const res = await axios.post(`${BASE_URL}/messages/send/${selectedUser._id}`, messageData,
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );
            console.log(res);
            set({ messages: [...messages, res.data] });

        } catch (error) {
            console.log(error);
        }
    },

    subscribeToMessages: (userId) => {
        const {selectedUser} = get();
        if(!selectedUser) return

        const socket = useAuthStore.getState().socket;

        socket.on("newMessage", (newMessage) => {    
            if (newMessage.senderId !== selectedUser._id) return;

            set({ messages: [...get().messages, newMessage] });
        });
    },

    unsubscribeFromMessages: () => {
        const socket = useAuthStore.getState().socket;
        socket.off("newMessage");
    },

    setSelectedUser: (selectedUser) => {
        set({ selectedUser });
    },

}))
