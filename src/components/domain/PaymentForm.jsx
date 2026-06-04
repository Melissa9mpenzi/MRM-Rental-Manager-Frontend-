import { useForm, useWatch } from "react-hook-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { paymentsApi } from "../../api/paymentsApi";
import { Input } from "../ui/Input";
import { Button } from "../ui/Button";
import PaymentMethodIcon from "../payments/PaymentMethodIcon";
import { RECORD_PAYMENT_METHODS } from "../../lib/paymentMethods";
const TYPES   = ["rent","deposit","penalty","other"];
const today   = new Date().toISOString().split("T")[0];

export default function PaymentForm({ tenant, onSuccess }) {
  const qc = useQueryClient();
  const now = new Date();

  const { register, handleSubmit, reset, control, formState: { errors } } = useForm({
    defaultValues: {
      amount:         tenant?.monthly_rent || "",
      payment_method: "mtn_momo",
      payment_type:   "rent",
      period_month:   now.getMonth() + 1,
      period_year:    now.getFullYear(),
      payment_date:   today,
    },
  });

  const selectedMethod = useWatch({ control, name: "payment_method" });

  const mutation = useMutation({
    mutationFn: (data) => paymentsApi.create({
      ...data,
      tenant_id:    tenant.id,
      amount:       parseFloat(data.amount),
      period_month: parseInt(data.period_month),
      period_year:  parseInt(data.period_year),
    }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["tenant", tenant.id] });
      qc.invalidateQueries({ queryKey: ["payments", tenant.id] });
      qc.invalidateQueries({ queryKey: ["dashboard-stats"] });
      toast.success("Payment recorded!");
      reset();
      onSuccess?.();
    },
    onError: (e) => toast.error(e.response?.data?.detail || "Failed to record payment"),
  });

  return (
    <form onSubmit={handleSubmit(d => mutation.mutate(d))} className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <Input label="Amount (UGX)" type="number" required error={errors.amount?.message}
          {...register("amount", { required: "Required" })} />
        <Input label="Payment date" type="date" required
          {...register("payment_date", { required: "Required" })} />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="input-label">Method</label>
          <div className="flex items-center gap-2">
            <PaymentMethodIcon method={selectedMethod} className="h-9 w-9 flex-shrink-0 rounded-lg" />
            <select className="input-field min-w-0 flex-1" {...register("payment_method")}>
              {RECORD_PAYMENT_METHODS.map((m) => (
                <option key={m.id} value={m.apiValue}>
                  {m.label}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div>
          <label className="input-label">Type</label>
          <select className="input-field" {...register("payment_type")}>
            {TYPES.map(t => <option key={t} value={t}>{t.charAt(0).toUpperCase()+t.slice(1)}</option>)}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="input-label">Month</label>
          <select className="input-field" {...register("period_month")}>
            {["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"].map((m,i) => (
              <option key={i} value={i+1}>{m}</option>
            ))}
          </select>
        </div>
        <Input label="Year" type="number" {...register("period_year")} />
      </div>

      <Input label="Reference / Transaction ID" placeholder="e.g. MoMo ref..." {...register("reference")} />
      <div>
        <label className="input-label">Notes</label>
        <textarea className="input-field resize-none min-h-[50px]" {...register("notes")} />
      </div>

      <Button type="submit" fullWidth loading={mutation.isPending}>Record Payment</Button>
    </form>
  );
}