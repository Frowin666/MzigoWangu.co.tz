import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { initializeApp } from "firebase/app";
import { getFirestore, collection, addDoc, onSnapshot } from "firebase/firestore";
import { getAuth, signInWithEmailAndPassword, onAuthStateChanged, signOut } from "firebase/auth";

// 🔥 FIREBASE CONFIG
const firebaseConfig = {
  apiKey: "YOUR_KEY",
  authDomain: "YOUR_DOMAIN",
  projectId: "YOUR_PROJECT_ID",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

// 🔐 LOGIN PAGE
function Login({ setUser }) {
  const [email,setEmail]=useState("");
  const [password,setPassword]=useState("");

  const handleLogin = async ()=>{
    try{
      const res = await signInWithEmailAndPassword(auth,email,password);
      setUser(res.user);
    }catch(err){
      alert("Login failed");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen">
      <Card className="p-6 space-y-4">
        <Input placeholder="Email" onChange={e=>setEmail(e.target.value)} />
        <Input placeholder="Password" type="password" onChange={e=>setPassword(e.target.value)} />
        <Button onClick={handleLogin}>Login</Button>
      </Card>
    </div>
  );
}

// 📦 ADD MZIGO
function AddMzigo(){
  const [form,setForm]=useState({customer:"",status:"Safarini",price:0,phone:""});

  const handleAdd = async ()=>{
    await addDoc(collection(db,"mizigo"),form);

    // 📲 FAKE SMS / WHATSAPP
    alert(`SMS sent to ${form.phone}: Mzigo wako umeandikwa!`);

    setForm({customer:"",status:"Safarini",price:0,phone:""});
  };

  return (
    <div className="flex gap-2">
      <Input placeholder="Mteja" value={form.customer} onChange={e=>setForm({...form,customer:e.target.value})}/>
      <Input placeholder="Simu" value={form.phone} onChange={e=>setForm({...form,phone:e.target.value})}/>
      <Input placeholder="Bei" type="number" value={form.price} onChange={e=>setForm({...form,price:Number(e.target.value)})}/>
      <Button onClick={handleAdd}>Ongeza</Button>
    </div>
  );
}

// 💳 PAYMENT SIMULATION
function Payment(){
  const handlePay = ()=>{
    alert("M-Pesa Payment request sent!");
  };

  return (
    <Card>
      <CardContent className="p-4">
        <h2>Lipa kwa M-Pesa</h2>
        <Button onClick={handlePay}>Lipa Sasa</Button>
      </CardContent>
    </Card>
  );
}

export default function App(){
  const [user,setUser]=useState(null);
  const [data,setData]=useState([]);

  useEffect(()=>{
    onAuthStateChanged(auth,(u)=>setUser(u));
  },[]);

  useEffect(()=>{
    if(!user) return;
    const unsub = onSnapshot(collection(db,"mizigo"),(snap)=>{
      setData(snap.docs.map(doc=>({id:doc.id,...doc.data()})));
    });
    return ()=>unsub();
  },[user]);

  if(!user) return <Login setUser={setUser}/>;

  return (
    <div className="p-4 space-y-6">
      <div className="flex justify-between">
        <h1>Dashboard</h1>
        <Button onClick={()=>signOut(auth)}>Logout</Button>
      </div>

      <div>Mizigo: {data.length}</div>
      <AddMzigo/>
      <Payment/>
    </div>
  );
}
