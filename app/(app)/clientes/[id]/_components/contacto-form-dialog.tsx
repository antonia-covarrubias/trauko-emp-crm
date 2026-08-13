"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
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
import { contactoSchema, type ContactoFormValues } from "@/lib/validations";
import { createContacto, updateContacto } from "@/lib/actions/contactos";
import type { Contacto } from "@/lib/types";

type ContactoFormDialogProps = {
  clienteId: string;
  contacto?: Contacto;
  trigger: React.ReactElement<{ children?: React.ReactNode }>;
};

function toValues(contacto?: Contacto): ContactoFormValues {
  return {
    nombre: contacto?.nombre ?? "",
    email: contacto?.email ?? "",
    telefono: contacto?.telefono ?? "",
    cargo: contacto?.cargo ?? "",
    es_principal: contacto?.es_principal ?? false,
    notas: contacto?.notas ?? "",
  };
}

export function ContactoFormDialog({
  clienteId,
  contacto,
  trigger,
}: ContactoFormDialogProps) {
  const router = useRouter();
  const [open, setOpen] = React.useState(false);
  const isEditing = Boolean(contacto);

  const form = useForm<ContactoFormValues>({
    resolver: zodResolver(contactoSchema),
    defaultValues: toValues(contacto),
  });

  async function onSubmit(values: ContactoFormValues) {
    const result = isEditing
      ? await updateContacto(contacto!.id, clienteId, values)
      : await createContacto(clienteId, values);

    if (!result.success) {
      toast.error(result.error);
      return;
    }

    toast.success(isEditing ? "Contacto actualizado." : "Contacto agregado.");
    setOpen(false);
    router.refresh();
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (next) form.reset(toValues(contacto));
      }}
    >
      <DialogTrigger render={trigger}>{trigger.props.children}</DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Editar contacto" : "Nuevo contacto"}</DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Actualiza los datos de este contacto."
              : "Agrega un contacto para este cliente."}
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

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
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
            </div>

            <FormField
              control={form.control}
              name="cargo"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Cargo</FormLabel>
                  <FormControl>
                    <Input {...field} />
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
                    <Textarea rows={2} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="es_principal"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                  <div>
                    <FormLabel>Contacto principal</FormLabel>
                    <p className="text-xs text-muted-foreground">
                      Desmarca automáticamente al contacto principal anterior.
                    </p>
                  </div>
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
