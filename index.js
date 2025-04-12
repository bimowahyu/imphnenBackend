const express = require('express')
const helmet = require('helmet')
const rateLimit = require('express-rate-limit')
const Sequelize = require('sequelize')
const cors = require('cors')
const app = express()

const db = new Sequelize('imphnen','root','',{
    host: 'localhost',
    dialect: 'mysql',
    timezone: '+08:00',
})


const Imphnen = db.define('Imphnen',{
    katakata:{
        type:Sequelize.STRING,
        allowNull: false
    }
})
app.use(cors({
    origin: true,
    credentials: true, 
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    optionsSuccessStatus: 200
}));
app.use(helmet({
    contentSecurityPolicy: false, 
    crossOriginEmbedderPolicy: false,
    crossOriginResourcePolicy: { policy: "cross-origin" },
}));
const postLimiter = rateLimit({
    windowMs: 60 * 1000, 
    max: 1,              
    message: {
      status: 429,
      message: "Hanya boleh post 1x per menit.",
    },
    standardHeaders: true,
    legacyHeaders: false,
  });
  
app.use(express.json())
app.post('/createkatakata',postLimiter,
    async (req,res) => {
        try {
            const {katakata} = req.body
            const newImphnen = await Imphnen.create({katakata})
            res.json({message: 'Data created successfully', data: newImphnen})
        } catch (error) {
            return res.status(500).json(error.message)
        }
    }
)

app.get('/getkatakata',async(req,res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const offset = (page - 1) * limit;

        const { count, rows } = await Imphnen.findAndCountAll({
            limit,
            offset,
            order: [['createdAt', 'DESC']]
        })
        res.json({
            currentPage: page,
            totalPages: Math.ceil(count / limit),
            totalItems: count,
            data: rows,
          });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
})
app.get('/', (req, res) => {
    res.send('males');
});
db.sync()
  .then(() => {
    const port = 1000;
    app.listen(port, () => console.log(`Server running on port ${port}`));
  })
  .catch((err) => {
    console.error('Failed to sync database:', err);
  });