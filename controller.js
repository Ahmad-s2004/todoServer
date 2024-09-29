const {User, Task, Category} = require('./model.js')
const mongoose = require('mongoose')
const jwt = require('jsonwebtoken')


const signup = async (req, res) => {
    const { email, name, password } = req.body;
    try {
      if (!email || !name || !password) {
        return res.status(404).json({ message: "All fields are required" });
      }
  
      let findUser = await User.findOne({ email });
      if (findUser) {
        return res.status(400).json({ message: "Email already exists" });
      } else {
        const newUser = new User({ email, name, password });
        await newUser.save();
  
        return res.status(201).json({ message: "User created successfully" });
      }
    } catch (error) {
      console.log(error, email, name, password);
      return res.status(500).json({ message: "Internal server error", error });
    }
  };
  
const signin = async (req, res) => {
    const { email, password } = req.body;
    
    try {
      if (!email || !password) {
        return res.status(404).json({ message: "All fields are required" });
      }
  
      let findUser = await User.findOne({ email });
      
      if (!findUser) {
        return res.status(404).json({ message: "User not found" });
      }
  
      if (findUser.password !== password) {
        return res.status(401).json({ message: "Invalid credentials" });
      }
  
      const token = jwt.sign({ id: findUser._id }, 'your_secret_key', { expiresIn: '72h' });
      return res.status(200).cookie('token', token, ).json({ message: "User logged in successfully", findUser, token });
      
    } catch (error) {
      return res.status(500).json({ message: "Internal server error" });
    }
  };
  

const authenticateToken = (req, res, next) => {
    const token = req.headers.authorization || req.cookies.token;
    if (token == null) return res.status(401).json({ message: 'Token not found' });
    jwt.verify(token, 'your_secret_key', (err, user) => {
      if (err) return res.status(403).json({ message: 'Token is not valid' });
      req.user = user;
      next();
    });
}

const createTask = async (req, res) => {
    const { title, description, dueDate, priority, favourite, category } = req.body;
    try {
        if (!title || !description) {
            return res.status(400).json({ message: "Title and description are required" });
        }

        let categoryId;
        if (category) {
            const categoryExists = await Category.findOne({ name: category });

            if (categoryExists) {
                categoryId = categoryExists._id;
            } else {
                const newCategory = new Category({ name: category, userId: req.user.id });
                const savedCategory = await newCategory.save();
                categoryId = savedCategory._id;
            }
        }

        const newTask = new Task({
            userId: req.user.id,
            title,
            description,
            dueDate,
            priority,
            favourite,
            ...(categoryId && { categoryId })
        });

        await newTask.save();

        return res.status(201).json({ message: "Task created successfully", newTask });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Internal server error", error });
    }
};


const getTasks = async(req, res) => {
    try {
        const tasks = await Task.find({userId: req.user.id})
        return res.status(200).json({message:"Tasks retrieved successfully", tasks})
    } catch (error) {
        console.log(error)
        return res.status(500).json({message:"Internal server error"})
    }
}

const searchTasks = async (req, res) => {
    const { search } = req.query;
    if (!search) {
        return res.status(400).json({ message: "Search term is required." });
    }

    try {
        const tasks = await Task.find({
            userId: req.user.id,
            title: { $regex: search, $options: 'i' }
        });

        return res.status(200).json({ message: "Tasks retrieved successfully", tasks });
    } catch (error) {
        console.error("Error retrieving tasks:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};



const updateTask = async(req, res) => {
    const {title, description, dueDate, priority, favourite} = req.body;
    try {
        if(!title &&!description &&!dueDate &&!priority &&!favourite){
            return res.status(404).json({message:"No fields to update"})
        }
        const updatedTask = await Task.findByIdAndUpdate(req.params.id, {title, description, dueDate, priority, favourite}, {new: true})
        if(!updatedTask){
            return res.status(404).json({message:"Task not found"})
        }
        return res.status(200).json({message:"Task updated successfully", updatedTask})
    } catch (error) {
        console.log(error)
        return res.status(500).json({message:"Internal server error"})
    }
}

const deleteTask = async(req, res) => {
    try {
        const deletedTask = await Task.findByIdAndDelete(req.params.id)
        if(!deletedTask){
            return res.status(404).json({message:"Task not found"})
        }
        return res.status(200).json({message:"Task deleted successfully"})
    } catch (error) {
        console.log(error)
        return res.status(500).json({message:"Internal server error"})
    }
}

let getUser = async(req, res)=>{
    try {
        const user = await User.findById(req.user.id)
        if(!user){
            return res.status(404).json({message:"User not found"})
        }
        return res.status(200).json({message:"User retrieved successfully", user})
    } catch (error) {
        console.log(error)
        return res.status(500).json({message:"Internal server error"})
    }
}

// const getTask = async(req, res) => {
//     try {
//         const task = await Task.findById(req.params.id)
//         if(!task){
//             return res.status(404).json({message:"Task not found"})
//         }
//         return res.status(200).json({message:"Task retrieved successfully", task})
//     } catch (error) {
//         console.log(error)
//         return res.status(500).json({message:"Internal server error"})
//     }
// }

const getTasksByPriority = async(req, res) => {
    try {
        const tasks = await Task.find({userId: req.user.id, priority: req.params.priority}).sort({dueDate: 'asc'})
        if(!tasks){
            return res.status(404).json({message:"Tasks not found"})
        }
        return res.status(200).json({message:"Tasks retrieved successfully", tasks})
    } catch (error) {
        console.log(error)
        return res.status(500).json({message:"Internal server error"})
    }
}

const getTasksByFavourite = async(req, res) => {
    try {
        const tasks = await Task.find({userId: req.user.id, favourite: true}).sort({dueDate: 'asc'})
        if(!tasks){
            return res.status(404).json({message:"Tasks not found"})
        }
        return res.status(200).json({message:"Tasks retrieved successfully", tasks})
    } catch (error) {
        console.log(error)
        return res.status(500).json({message:"Internal server error"})
    }
}

const getTodayTask = async(req, res)=>{
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(today.getDate() + 1);
        const tasks = await Task.find({userId: req.user.id, dueDate: {$gte: today, $lt: tomorrow}})
        if(tasks.length === 0){
            return res.status(200).json({message:"No Tasks for Today"})
        }
        if(!tasks){
            return res.status(404).json({message:"Tasks not found"})
        }
        return res.status(200).json({message:"Tasks retrieved successfully", tasks})
    } catch (error) {
        console.log(error)
        return res.status(500).json({message:"Internal server error", error})
    }
}


// Category here


const createCategory = async (req, res) => {
    const { name } = req.body;
    try {
        if (!name) {
            return res.status(400).json({ message: "Category name is required" });
        }

        const existingCategory = await Category.findOne({ userId: req.user.id, name });
        if (existingCategory) {
            return res.status(400).json({ message: "Category already exists for this user" });
        }

        const newCategory = new Category({ userId: req.user.id, name });
        await newCategory.save();
        return res.status(201).json({ message: "Category created successfully", newCategory });
    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({ message: "Category already exists for this user" });
        }
        console.error(error);
        return res.status(500).json({ message: "Internal server error" });
    }
};




const getCategories = async(req, res) => {
    try {
        const categories = await Category.find({userId: req.user.id})
        if(!categories){
            return res.status(404).json({message:"Categories not found"})
        }
        return res.status(200).json({message:"Categories retrieved successfully", categories})
    } catch (error) {
        console.log(error)
        return res.status(500).json({message:"Internal server error"})
    }
}

const deleteCategory = async(req, res) => {
    try {
        let {_id} = req.params
        const deletedCategory = await Category.findByIdAndDelete(_id)
        if(!deletedCategory){
            return res.status(404).json({message:"Category not found"})
        }
        return res.status(200).json({message:"Category deleted successfully"})
    } catch (error) {
        console.log(error)
        return res.status(500).json({message:"Internal server error"})
    }
}

const getTasksByCategory = async (req, res) => {
    try {
        const { _id } = req.params;

        if (!_id || !mongoose.Types.ObjectId.isValid(_id)) {
            return res.status(400).json({ message: "Invalid or missing category ID." });
        }
        const tasks = await Task.find({ userId: req.user.id, categoryId: _id }).sort({ dueDate: 'asc' });
        if (!tasks || tasks.length === 0) {
            return res.status(404).json({ message: "No tasks found for this category" });
        }
        return res.status(200).json({ message: "Tasks retrieved successfully", tasks });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Internal server error" });
    }
};

const searchCategory = async (req, res) => {
    const { name } = req.params; 

    if (!name) {
        return res.status(400).json({ message: "Search term is required." });
    }

    try {
        const categories = await Category.find({
            userId: req.user.id,
            name: { $regex: name, $options: 'i' }
        });
        return res.status(200).json({ message: "Categories retrieved successfully", categories });
    } catch (error) {
        console.error("Error retrieving categories:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};






module.exports = {
    signup,
    signin,
    authenticateToken,
    createTask,
    getTasks,
    updateTask,
    deleteTask,
    getTasksByPriority,
    getTodayTask,
    searchTasks,
    getUser,
    createCategory,
    getCategories,
    getTasksByCategory,
    deleteCategory,
    searchCategory,
}
