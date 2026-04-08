'use client'


import '@/Styles/auth/Login.css'
import Link from 'next/link'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

import { useAuthContext } from '@/Context/AuthContext'


const SignUp = () => {


    const [name,setName] = useState("");
    const [phone_no,setPhoneNo] = useState("");
    const [pwd,setPwd] = useState('');
    const {signUp} = useAuthContext();
    const router = useRouter();

    const postDetails=async (obj:any)=>{
        const res = await signUp(obj);
        if(res?.code == 200){
            alert("Successfully Created an Account")
            router.push("/login")
        }
        else{
            alert("Problem with Creating An Account")
        }
    }

    const handleSubmit=(e:any)=>{
        e.preventDefault();
        if(name.trim() == "" || name.length<1){
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

        const obj={name,phone_no,pwd}
        postDetails(obj)


    }

    return (
        <div className="Auth Page">
            <div className='AuthForm'>
                <h1 style={{ textAlign: "center", paddingBottom: "25px", paddingTop: "10px" }}>Expense Tracker</h1>
                <h3 style={{ textAlign: "center", paddingBottom: "10px" }}>Welcome Back</h3>
                <p style={{ textAlign: "center", paddingBottom: "10px", fontSize: "14px" }}>Please Sign Up To Continue</p>
                <form onSubmit={(e)=>{handleSubmit(e)}}>
                    <input type="text" placeholder='Enter Name' 
                    onChange={(e)=>{setName(e.target.value)}}
                    value={name}
                    />
                    <input type="tel" maxLength={10} 
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
                    <button >Sign Up</button>

                    <p>Already Have an Account Please <Link href='/login'>Sign up</Link></p>
                </form>
            </div>

        </div>
    )
}




export default SignUp