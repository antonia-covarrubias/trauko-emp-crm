"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { grupoSchema, type GrupoFormValues } from "@/lib/validations";
import { createGrupo, updateGrupo } from "@/lib/actions/grupos";

const DEFAULT_VALUES: GrupoFormValues = { nombre: "", notas: "" };

type GrupoFormDialogProps = {
  grupo?: { id: string; nombre: string; notas: string | null };
  trigger?: React.ReactElement<{ children?: React.ReactNode }>;
};

export function GrupoFormDialog({ grupo, trigger }: GrupoFormDialogProps) {
  const router = useRouter();
  const [open, setOpen] = React.useState(false);
  const isEditing = Boolean(grupo);

  const defaultValues = React.useMemo<GrupoFormValues>(
    () => ({ nombre: grupo?.nombre ?? "", notas: grupo?.notas ?? "" }),
    [grupo],
  );

  const form = useForm<GrupoFormValues>({
    resolver: zodResolver(grupoSchema),
    defaultValues,
  });

  async function onSubmit(values: GrupoFormValues) {
    if (isEditing) {
      const result = await updateGrupo(grupo!.id, values);
      if (!result.success) {
        toast.error(result.error);
        return;
      }
      toast.success("Grupo actualizado.");
      setOpen(false);
      router.refresh();
      return;
    }

    const result = await createGrupo(values);
    if (!result.success) {
      toast.error(result.error);
      return;
    }
    toast.success("Grupo creado.");
    setOpen(false);
    form.reset(DEFAULT_VALUES);
    router.push(`/grupos/${result.data.id}`);
  }

  const triggerElement = trigger ?? (
    <Button>
      <Plus />
      Nuevo grupo
    </Button>
  );

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (next) form.reset(defaultValues);
      }}
    >
      <DialogTrigger render={triggerElement}>{triggerElement.props.children}</DialogTrigger>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Editar grupo" : "Nuevo grupo"}</DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Actualiza el nombre o las notas de este grupo."
              : "Crea un grupo empresarial. Un cliente puede pertenecer a un grupo de una sola empresa."}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4">
            <FormField
              control={form.control}
              name="nombre"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nombre</FormLabel>
                  <FormControl>
                    <Input {...field} autoFocus />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="notas"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notas</FormLabel>
                  <FormControl>
                    <Textarea rows={3} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? "Guardando…" : "Guardar"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
