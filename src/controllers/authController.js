import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import User from '../models/User.js'

export async function register(req,res){
    const { name, email, password} = req.body;

    if(!name || !email || !password){
        return res.status(400).json({error:'all fields required'})
    }
    
    try{
        const existingUser =  await User.findOne({email})

        if(existingUser){
            return res.status(409).json({error:'Email already registered'})
        }

        const hashedPassword = await bcrypt.hash(password,10)

        const user = await User.create({
            name,
            email,
            password: hashedPassword
        })

        const token = jwt.sign(
            {userId: user._id},
            process.env.JWT_SECRET,
            {expiresIn: '7d'}
        )

        res.status(201).json({
            success: true,
            user: { id: user._id, name: user.name, email: user.email },
            token
        })
    }catch(error){
        console.error("Login error: ",error)
        res.status(500).json({error:"Something went wrong"})
    }
}

export async function login(req,res){
    const {email,password} = req.body;
    if(!email || !password){
        return res.status(400).json({erorr: 'Email and password are required'})
    }
    try{
        const user =  await User.findOne({email})
        if(!user){
            return res.status(401).json({error: 'Invalid email or password'})
        }

        const Match = await bcrypt.compare(password,user.password)
        if(!Match){
            return res.status(401).json({error: 'Invalid email or password'}) 
        }

        const token = jwt.sign(
            { userId: user._id },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        )

        res.json({
            success:true,
            user: {id:user._id, name:user.name, email:user.email},
            token
        })
        } catch (error) {
        console.error('login error:', error);
        res.status(500).json({error: "something went wrong"})
    }
    
}