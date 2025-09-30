import { auth } from './firebase';

export const getCurrentUser = () => auth.currentUser;
