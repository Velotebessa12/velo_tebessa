import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";



export async function GET (req : NextRequest){
    try {
        
        const categories = await prisma.category.findMany({
            include : {
                translations : true
            },
            orderBy : {
                createdAt : "desc"
            }
        })


        return NextResponse.json({categories})
    } catch (error) {
        return NextResponse.json({error : "Internal error"}, {status : 500})
    }
}