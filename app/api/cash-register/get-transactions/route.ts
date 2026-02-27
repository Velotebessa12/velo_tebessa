import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";



export async function GET (req : NextRequest){
    try {
        
        const transactions = await prisma.transaction.findMany({
            orderBy : {
                createdAt : "desc"
            }
        })


        return NextResponse.json({ transactions })
    } catch (error) {
        return NextResponse.json({error : "Internal error"}, {status : 500})
    }
}