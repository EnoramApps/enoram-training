import { NextResponse } from "next/server";
import { db } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

export async function GET() {
    try {
        const docRef = await addDoc(collection(db, "test"), {
            message: "Hello from Next.js + Firestore 🚀",
            createdAt: serverTimestamp(),
        });
        console.log("✅ Tes Firestore sukses, ID:", docRef.id);
        return NextResponse.json({ success: true, id: docRef.id });
    } catch (err: any) {
        console.error("🔥 Tes Firestore gagal:", err);
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
