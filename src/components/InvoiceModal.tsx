import React from "react";
import { SaleTransaction } from "../types";
import { formatFCFA } from "../utils/formatters";
import { X, Printer, Download, CheckCircle2, AlertCircle, Building, Phone, MapPin, Mail } from "lucide-react";

interface InvoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  sale: SaleTransaction | null;
}

export const InvoiceModal: React.FC<InvoiceModalProps> = ({
  isOpen,
  onClose,
  sale,
}) => {
  if (!isOpen || !sale) return null;

  const handlePrint = () => {
    window.print();
  };

  const balanceDue = sale.totalAmountFCFA - sale.paidAmountFCFA;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-3xl w-full p-6 space-y-6 my-8 print:shadow-none print:border-none print:p-0">
        {/* Modal Controls Header (Hidden on Print) */}
        <div className="flex items-center justify-between border-b border-slate-200 pb-4 print:hidden">
          <div className="flex items-center space-x-2 text-slate-900 font-extrabold text-lg">
            <span>Facture Client #{sale.invoiceNumber}</span>
            <span
              className={`text-xs px-2.5 py-0.5 rounded-full font-bold ${
                sale.paymentStatus === "Payé"
                  ? "bg-emerald-100 text-emerald-800"
                  : sale.paymentStatus === "Partiel"
                  ? "bg-amber-100 text-amber-800"
                  : "bg-rose-100 text-rose-800"
              }`}
            >
              {sale.paymentStatus}
            </span>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handlePrint}
              className="flex items-center space-x-1.5 bg-emerald-700 hover:bg-emerald-800 text-white px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer shadow-sm"
            >
              <Printer className="w-4 h-4" />
              <span>Imprimer / Imprimer en PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-500 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* PRINTABLE INVOICE CONTENT */}
        <div className="space-y-6 font-sans text-slate-800 print:text-black">
          {/* Company Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start gap-4 border-b-2 border-slate-900 pb-6">
            <div className="space-y-1">
              <div className="flex items-center space-x-2">
                <div className="w-9 h-9 rounded-lg bg-amber-500 text-slate-950 font-black flex items-center justify-center text-base shadow">
                  IÉ
                </div>
                <div>
                  <h2 className="text-xl font-black text-slate-900 tracking-tight">IVOIRE ÉLEVAGE</h2>
                  <p className="text-xs font-bold text-emerald-800 uppercase tracking-wide">
                    Holding Agro-Pastorale Intégrée
                  </p>
                </div>
              </div>
              <div className="text-xs text-slate-600 pt-2 space-y-0.5">
                <p className="flex items-center space-x-1">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  <span>Siège social & Site d'Élevage : Abidjan / Bingerville, Côte d'Ivoire</span>
                </p>
                <p className="flex items-center space-x-1">
                  <Phone className="w-3.5 h-3.5 text-slate-400" />
                  <span>Service Commercial : +225 07 00 00 11 22 / +225 05 00 00 33 44</span>
                </p>
                <p className="flex items-center space-x-1">
                  <Mail className="w-3.5 h-3.5 text-slate-400" />
                  <span>ventes@ivoire-elevage.ci • www.ivoire-elevage.ci</span>
                </p>
              </div>
            </div>

            {/* Invoice Meta Box */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-right w-full sm:w-auto">
              <div className="text-xs text-slate-500 font-bold uppercase tracking-wider">FACTURE N°</div>
              <div className="text-xl font-black text-slate-900 mt-0.5">{sale.invoiceNumber}</div>
              <div className="text-xs text-slate-600 mt-2">
                Date d'Émission : <strong>{sale.date}</strong>
              </div>
              <div className="text-xs text-slate-600">
                Module : <strong className="text-emerald-800">{sale.module}</strong>
              </div>
            </div>
          </div>

          {/* Client & Sales Rep Information */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            {/* Client Info */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-1">
              <div className="text-[11px] font-extrabold uppercase text-slate-500 tracking-wider">
                Facturé à (Client) :
              </div>
              <div className="text-base font-extrabold text-slate-900">{sale.clientName}</div>
              <div className="text-slate-600">Téléphone : {sale.clientPhone}</div>
            </div>

            {/* Agent / Delivery Info */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-1">
              <div className="text-[11px] font-extrabold uppercase text-slate-500 tracking-wider">
                Suivi Commercial :
              </div>
              <div className="text-sm font-bold text-slate-900">
                Commercial : {sale.agentName || "Vente directe au siège"}
              </div>
              <div className="text-slate-600">Mode de Règlement : {sale.paymentMethod}</div>
              <div className="text-slate-600">
                Statut : <span className="font-bold">{sale.paymentStatus}</span>
              </div>
            </div>
          </div>

          {/* Itemized Table */}
          <div className="overflow-x-auto border border-slate-200 rounded-xl">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-900 text-white font-bold uppercase text-[11px] tracking-wider">
                  <th className="p-3">Désignation des Produits / Découpes</th>
                  <th className="p-3 text-center">Catégorie</th>
                  <th className="p-3 text-right">Quantité</th>
                  <th className="p-3 text-right">Prix Unitaire</th>
                  <th className="p-3 text-right">Montant Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 font-medium">
                {sale.items.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50">
                    <td className="p-3 font-bold text-slate-900">{item.productName}</td>
                    <td className="p-3 text-center text-slate-500">
                      <span className="px-2 py-0.5 rounded bg-slate-100 text-[10px] font-bold">
                        {item.category}
                      </span>
                    </td>
                    <td className="p-3 text-right font-bold text-slate-900">{item.quantity}</td>
                    <td className="p-3 text-right">{formatFCFA(item.unitPriceFCFA)}</td>
                    <td className="p-3 text-right font-extrabold text-slate-900">
                      {formatFCFA(item.totalPriceFCFA)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Totals Summary */}
          <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
            <div className="text-xs text-slate-500 space-y-1 sm:max-w-xs">
              <div className="font-bold text-slate-700">Conditions de Paiement & Notes :</div>
              <p className="italic text-slate-600">{sale.notes || "Paiement à la livraison ou par transfert mobile Wave/Orange Money."}</p>
              <div className="pt-2 text-[10px] text-slate-400">
                Numéro Référence Mobile Money Ivoire Élevage : +225 07 00 00 11 22 (Wave / OM)
              </div>
            </div>

            <div className="bg-slate-900 text-white p-4 rounded-xl space-y-2 w-full sm:w-72 text-xs">
              <div className="flex justify-between text-slate-300">
                <span>Total Bruto HT :</span>
                <span className="font-bold">{formatFCFA(sale.totalAmountFCFA)}</span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>Remise / Taxes :</span>
                <span className="font-bold">0 FCFA</span>
              </div>
              <div className="border-t border-slate-700 pt-2 flex justify-between text-base font-black text-amber-400">
                <span>NET À PAYER :</span>
                <span>{formatFCFA(sale.totalAmountFCFA)}</span>
              </div>
              <div className="border-t border-slate-800 pt-2 flex justify-between text-slate-300">
                <span>Montant Réglé :</span>
                <span className="text-emerald-400 font-bold">{formatFCFA(sale.paidAmountFCFA)}</span>
              </div>
              {balanceDue > 0 && (
                <div className="flex justify-between text-rose-300 font-bold bg-rose-950/60 p-2 rounded">
                  <span>Reste à Payer :</span>
                  <span>{formatFCFA(balanceDue)}</span>
                </div>
              )}
            </div>
          </div>

          {/* Footer & Signatures */}
          <div className="pt-8 border-t border-slate-200 text-xs flex justify-between items-end text-slate-500">
            <div>
              <p className="font-bold text-slate-800">Merci de votre confiance !</p>
              <p className="text-[10px]">IVOIRE ÉLEVAGE — Des produits sains, frais et traçables de Côte d'Ivoire.</p>
            </div>
            <div className="text-right space-y-8">
              <p className="font-bold text-slate-700">La Direction Commerciale</p>
              <p className="text-[10px] text-slate-400 italic">(Cachet et Signature)</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
