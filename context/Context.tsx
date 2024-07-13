import { Dispatch, SetStateAction, createContext, useState, ReactNode, useContext, useEffect } from "react";
import { getCurrentUser } from "@/lib/supabase";

//User and setUser
export type User = {
    username: string,
    email:string,
    userId: string,
    sessionId: string

}
export interface UserContextInterface{
    user: User,
    setUser: Dispatch<SetStateAction<User>>
}
const userDefaultState = {
    user: {
    username:'',
    email:'',
    userId: '',
    sessionId: ''
},
setUser: (user: User) => { }
} as UserContextInterface

//IsLoggedIn and setIsLoggedIn
export type IsLoggedIn = {
    isLoggedIn: boolean
}
export interface IsLoggedInContextInterface{
    isLoggedIn: IsLoggedIn,
    setIsLoggedIn: Dispatch<SetStateAction<IsLoggedIn>>
}
const isLoggedInDefaultState = {
    isLoggedIn:{
        isLoggedIn: false
    },
    setIsLoggedIn: (isLoggedIn: IsLoggedIn) => { }
} as IsLoggedInContextInterface

//isLoading and setIsLoading
export type IsLoading = {
    isLoading: boolean
}
export interface IsLoadingInterface{
    isLoading: IsLoading
    setIsLoading: Dispatch<SetStateAction<IsLoading>>
}
const isLoadingDefaultState = {
    isLoading:{
        isLoading: true
    },
    setIsLoading: (isLoading: IsLoading) => { }
} as IsLoadingInterface

// Create a combined context type
interface GlobalContextInterface {
    user: User;
    setUser: Dispatch<SetStateAction<User>>;
    isLoggedIn: IsLoggedIn;
    setIsLoggedIn: Dispatch<SetStateAction<IsLoggedIn>>;
    isLoading: IsLoading;
  }
  
  const GlobalContext = createContext<GlobalContextInterface>({
    user: userDefaultState.user,
    setUser: userDefaultState.setUser,
    isLoggedIn: isLoggedInDefaultState.isLoggedIn,
    setIsLoggedIn: isLoggedInDefaultState.setIsLoggedIn,
    isLoading: isLoadingDefaultState.isLoading

  });
export const useGlobalContext = () => useContext(GlobalContext)

type GlobalProviderProps={
    children: ReactNode
}

export default function GlobalProvider({children}: GlobalProviderProps){
    const [user, setUser] = useState<User>(
        userDefaultState.user
    );
    const [isLoggedIn, setIsLoggedIn] = useState<IsLoggedIn>(isLoggedInDefaultState.isLoggedIn);
    const [isLoading, setIsLoading ] = useState<IsLoading>(isLoadingDefaultState.isLoading)

    useEffect(()=>{
        getCurrentUser()
        .then((result)=>{
            if(result){
                setIsLoggedIn({isLoggedIn:true})
                setUser({
                    email: result?.email || '',
                    username: result?.email || '',
                    userId: result?.id || '',
                    sessionId: result?.id || ''
            
                    })
            }else{
                setIsLoggedIn({isLoggedIn:false})
                setUser(userDefaultState.user)
            }
        })
        .catch((error)=>{
            console.log(error)
        })
        .finally(()=>{
            setIsLoading({isLoading:false})
        })
      }, [])

    return(
        <GlobalContext.Provider
        value={{
            isLoggedIn,
            setIsLoggedIn,
            user,
            setUser,
            isLoading}}>
            {children}
        </GlobalContext.Provider>
        
    )

}