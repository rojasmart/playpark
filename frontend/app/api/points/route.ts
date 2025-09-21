import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    // URL do backend
    const backendUrl = process.env.BACKEND_URL || "http://localhost:5000";

    // Obter FormData da requisição
    const formData = await req.formData();

    // Fazer proxy da requisição para o backend
    const response = await fetch(`${backendUrl}/api/points`, {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json();
      return NextResponse.json({ error: errorData.error || "Erro ao criar parque" }, { status: response.status });
    }

    const result = await response.json();
    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    console.error("Erro na API route:", error);
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 });
  }
}

export async function GET() {
  try {
    // URL do backend
    const backendUrl = process.env.BACKEND_URL || "http://localhost:5000";

    // Fazer proxy da requisição para o backend
    const response = await fetch(`${backendUrl}/api/points`);

    if (!response.ok) {
      return NextResponse.json({ error: "Erro ao buscar parques" }, { status: response.status });
    }

    const result = await response.json();
    return NextResponse.json(result);
  } catch (error) {
    console.error("Erro na API route:", error);
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 });
  }
}
