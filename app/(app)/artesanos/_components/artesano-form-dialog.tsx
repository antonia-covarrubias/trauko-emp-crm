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
import { Switch } from "@/components/ui/switch";
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
import { artesanoSchema, type ArtesanoFormValues } from "@/lib/validations";
import { createArtesano, updateArtesano } from "@/lib/actions/artesanos";
import type { Artesano } from "@/lib/types";

const DEFAULT_VALUES: ArtesanoFormValues = {
  nombre: "",
  especialidad: "",
  contacto: "",
  telefono: "",
  email: "",
  notas: "",
  activo: true,
};

type ArtesanoFormDialogProps = {
  artesano?: Artesano;
  trigger?: React.ReactElement<{ children?: React.ReactNode }>;
};

function toValues(artesano?: Artesano): ArtesanoFormValues {
  return {
    nombre: artesano?.nombre ?? "",
    especialidad: artesano?.especialidad ?? "",
    contacto: artesano?.contacto ?? "",
    telefono: artesano?.telefono ?? "",
    email: artesano?.email ?? "",
    notas: artesano?.notas ?? "",
    activo: artesano?.activo ?? true,
  };
}

export function ArtesanoFormDialog({ artesano, trigger }: ArtesanoFormDialogProps) {
  const router = useRouter();
  const [open, setOpen] = React.useState(false);
  const isEditing = Boolean(artesano);

  const form = useForm<ArtesanoFormValues>({
    resolver: zodResolver(artesanoSchema),
    defaultValues: toValues(artesano),
  });

  async function onSubmit(values: ArtesanoFormValues) {
    if (isEditing) {
      const result = await updateArtesano(artesano!.id, values);
      if (!result.success) {
        toast.error(result.error);
        return;
      }
      toast.success("Artesano actualizado.");
      setOpen(false);
      router.refresh();
      return;
    }

    const result = await createArtesano(values);
    if (!result.success) {
      toast.error(result.error);
      return;
    }
    toast.success("Artesano creado.");
    setOpen(false);
    form.reset(DEFAULT_VALUES);
    router.refresh();
  }

  const triggerElement = trigger ?? (
    <Button>
      <Plus />
      Nuevo artesano
    </Button>
  );

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (next) form.reset(toValues(artesano));
      }}
    >
      <DialogTrigger render={triggerElement}>{triggerElement.props.children}</DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Editar artesano" : "Nuevo artesano"}</DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Actualiza los datos de este artesano."
              : "Registra un artesano que fabrica productos para los pedidos."}
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
              name="especialidad"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Especialidad</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Ej: cuero, madera, grabado…" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="telefono"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Teléfono</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input type="email" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="contacto"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Contacto</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Persona de contacto, si aplica" />
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

            <FormField
              control={form.control}
              name="activo"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                  <FormLabel>Activo</FormLabel>
                  <FormControl>
                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
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
