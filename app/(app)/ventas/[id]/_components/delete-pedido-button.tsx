"use client";

import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DeleteAlertDialog } from "@/components/domain/delete-alert-dialog";
import { deletePedido } from "@/lib/actions/pedidos";

type DeletePedidoButtonProps = {
  pedidoId: string;
  clienteId: string;
};

export function DeletePedidoButton({ pedidoId, clienteId }: DeletePedidoButtonProps) {
  const router = useRouter();

  return (
    <DeleteAlertDialog
      trigger={
        <Button variant="destructive">
          <Trash2 />
          Eliminar
        </Button>
      }
      title="Eliminar pedido"
      description="¿Eliminar este pedido y todas sus líneas? Esta acción no se puede deshacer."
      onConfirm={async () => {
        const result = await deletePedido(pedidoId, clienteId);
        if (result.success) {
          router.push("/ventas");
        }
        return result;
      }}
    />
  );
}
