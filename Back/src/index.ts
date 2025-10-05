import  express  from "express";
import UserRoute from "./routes/UserRoute";
import EntrepriseRoute from "./routes/EntrepriseRoute";
import EmployeRoute from "./routes/EmployeRoute";
import AuthRoute from "./routes/AuthRoute";
import PaiementRoute from "./routes/PaiementRoute";
import PayrunRoute from "./routes/PayrunRoute";
import PayslipRoute from "./routes/PayslipRoute";
import PointageRoute from "./routes/PointageRoute";


import path from "path";
import cors from "cors";


const port = 4004;

const app = express();
app.use(express.json())

app.use(express.urlencoded({ extended: true }));

app.use(cors({
  origin: "http://localhost:5173", 
  methods: ["GET", "POST", "PUT", "DELETE"], 
  credentials: true 
}));

app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

app.use("/auth", AuthRoute)
app.use("/users", UserRoute)
app.use("/entreprises", EntrepriseRoute)
app.use("/employes", EmployeRoute)
app.use("/paiement", PaiementRoute)
app.use("/payrun", PayrunRoute)
app.use("/payslip", PayslipRoute)
app.use("/pointage", PointageRoute);





app.listen(port, ()=>{
    console.log(`Le serveur est en marche au http://localhost:${port}`);
})