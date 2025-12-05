export const signup = async (req,res) =>{
    console.log("Signup")
}

export const login = async (req,res) =>{
    console.log("login")
}

export const logout = async (req,res) =>{
    console.log("logout")
}

export const sendOtp = (req,res)=>{
    res.json({"OTP":657890})
}

export const verifyOtp = (req,res)=>{
    const jsonData = req.body;
    if(jsonData.OTP==657890){
        
    }
}