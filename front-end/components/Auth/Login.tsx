'use client'

import '@/Styles/auth/Login.css'
import Link from 'next/link'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthContext } from '@/Context/AuthContext'


const Login = () => {
    const router = useRouter()
    const [user_name, setUserName] = useState("");
    const [phone_no, setPhoneNo] = useState("");
    const [pwd, setPwd] = useState('');
    const { login } = useAuthContext();

    const postDetails = async(params:any)=>{
        const res = await login(params);
        if(res?.code == 200){
            alert("Successfully Login")
            router.push("/")
        }
        else{
            alert(`Problem with Sign IN :  ${res?.message}`)
        }
    }

     const handleSubmit=(e:any)=>{
        e.preventDefault();
        if(user_name.trim() == "" || user_name.length<1){
            alert("Please Enter a name")
            return
        }
        else if(phone_no.trim()=="" || phone_no.length<10){
            alert("Please Enter A valid Number")
            return
        }
        else if(pwd.trim() == ""){
            alert("Please Enter a Password")
            return
        }
        else if(pwd.length<6){
            alert("Atleast Enter 6 Letters")
            return
        }

        const obj={user_name,phone_no,pwd}
        postDetails(obj)


    }

    return (
        <div className="Auth Page">
            <div className='AuthForm'>
                <h1 style={{ textAlign: "center", paddingBottom: "25px", paddingTop: "10px" }}>Expense Tracker</h1>
                <h3 style={{ textAlign: "center", paddingBottom: "10px" }}>Welcome Back</h3>
                <p style={{ textAlign: "center", paddingBottom: "10px", fontSize: "14px" }}>Please Sign in To Continue</p>
                <form onSubmit={(e)=>{handleSubmit(e)}}>
                    <input type="text" placeholder='Enter Name' 
                    onChange={(e)=>{setUserName(e.target.value)}}
                    value={user_name}
                    />
                    <input type="tel" maxLength={10} pattern="[0-9]{10}"
                        onInput={(e) => {
                            const input = e.target as HTMLInputElement;
                            input.value = input.value.replace(/[^0-9]/g, "");
                        }}
                        placeholder='Enter Phone Number'
                        onChange={(e)=>{setPhoneNo(e.target.value)}}
                        value={phone_no}
                    />
                    <input type="password" placeholder='Enter Password' 
                    onChange={(e)=>{setPwd(e.target.value)}}
                    value={pwd}
                    />
                    <Link href='' style={{ textAlign: "right", fontSize: "14px", color: "rgb(57, 117, 189)", cursor: "pointer" }}>Forgot Password?</Link>
                    <button>Sign in</button>

                    <p>Didn't Have an Account Please <Link href='/sign-up'>Sign up</Link></p>
                </form>
            </div>

        </div>
    )
}




export default Login