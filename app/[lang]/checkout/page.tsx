"use client";

import { useEffect, useState, useCallback } from "react";
import {
  MapPin,
  Building2,
  Truck,
  ChevronDown,
  CheckCircle,
  AlertTriangle,
  AlertCircle,
} from "lucide-react";
import Image from "next/image";
import { ALGERIAN_WILAYAS } from "@/data";
import useShopStore from "@/store/useShopStore";
import toast from "react-hot-toast";
import { useLang } from "@/components/LanguageContext";
import { useRouter, useSearchParams } from "next/navigation";
import { getTranslations } from "@/lib/getTranslations";
import Loader from "@/components/Loader";

// ─── Types ────────────────────────────────────────────────────────────────────

interface StoredUser {
  id: string;
  name?: string;
  phoneNumber?: string;
}

interface Desk {
  code: string;
  name: string;
  address: string;
}

interface Commune {
  nom: string;
}

interface FormData {
  fullName: string;
  phoneNumber: string;
  wilaya: string;
  commune: string;
  deliveryMethod: "home" | "stopdesk";
  shippingCompany: string | null;
  station_code: string;
  shippingPrice: number;
  detailedAddress: string;
  orderNote: string;
  deliveryNote: string;
  createAccount: boolean;
  password: string;
}

// ─── Field Component ──────────────────────────────────────────────────────────

function Field({
  label,
  required,
  optional,
  children,
  hint,
}: {
  label: string;
  required?: boolean;
  optional?: boolean;
  children: React.ReactNode;
  hint?: string;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1.5">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
        {optional && (
          <span className="text-gray-400 font-normal ml-1">(Optionnel)</span>
        )}
      </label>
      {children}
      {hint && <p className="text-xs text-gray-400 mt-1">{hint}</p>}
    </div>
  );
}

const inputClass =
  "w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-400 focus:border-transparent outline-none transition-all text-sm bg-white";

const textareaClass =
  "w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-400 focus:border-transparent outline-none transition-all resize-none text-sm";

// ─── Main Component ───────────────────────────────────────────────────────────

export default function CheckoutPage() {
  const { cart, checkoutSnapshot, clearCart } = useShopStore();

  const { lang } = useLang();
  const router = useRouter();

  // Auth
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<StoredUser | null>(null);
  const searchParams = useSearchParams();

  // Delivery data
  const [desks, setDesks] = useState<Desk[]>([]);
  const [loadingDesks, setLoadingDesks] = useState(false);
  const [communes, setCommunes] = useState<Commune[]>([]);
  const [loadingCommunes, setLoadingCommunes] = useState(false);
  const [loadingShipping, setLoadingShipping] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [shippingPrice, setShippingPrice] = useState(0);
  // UI state
  const [isProcessing, setIsProcessing] = useState(false);
  const [shippingOption, setShippingOption] = useState<"FREE" | "PAID" | null>(
    null,
  );
  const [formData, setFormData] = useState<FormData>({
    fullName: "",
    phoneNumber: "",
    wilaya: "",
    commune: "",
    deliveryMethod: "home",
    shippingCompany: null,
    station_code: "",
    shippingPrice: 0,
    detailedAddress: "",
    orderNote: "",
    deliveryNote: "",
    createAccount: true,
    password: "",
  });

  // Derived from snapshot
  const subtotal = checkoutSnapshot?.subtotal ?? 0;
  const discount = checkoutSnapshot?.discount ?? 0;
  const total = checkoutSnapshot?.total ?? 0;

  // ── Guard: redirect if no snapshot ──
  // useEffect(() => {
  //   if (!checkoutSnapshot) {
  //     toast.error("Veuillez confirmer votre panier d'abord");
  //     router.push(`/${lang}/cart`);
  //   }
  // }, [checkoutSnapshot, lang, router]);

  // ── Load stored user ──
  useEffect(() => {
    try {
      const savedUser = localStorage.getItem("user");
      const auth = localStorage.getItem("isAuthenticated");
      if (savedUser) setUser(JSON.parse(savedUser));
      setIsAuthenticated(!!auth);
    } catch {
      // localStorage unavailable
    }
  }, []);

  useEffect(() => {
    const orderId = searchParams.get("editOrder");

    if (!orderId) {
      setIsEdit(false);
      return; // ⛔ do NOT load order
    }

    setIsEdit(true);

    const fetchOrder = async () => {
      toast.loading("Loading ...", { id: "loading-order" });

      try {
        const res = await fetch(`/api/orders/get-order?orderId=${orderId}`);
        if (!res.ok) throw new Error("Error fetching Order");

        const { order } = await res.json();

        setFormData({
          fullName: order.fullName || "",
          phoneNumber: order.phoneNumber || "",
          wilaya: order.wilaya || "",
          commune: order.commune || "",
          deliveryMethod: order.deliveryMethod || "home",
          shippingCompany: order.shippingCompany || null,
          station_code: order.station_code || "",
          shippingPrice: order.shippingPrice || 0,
          detailedAddress: order.detailedAddress || "",
          orderNote: order.orderNote || "",
          deliveryNote: order.deliveryNote || "",
          createAccount: order.createAccount ?? true,
          password: order.password || "",
        });

        toast.success("Loading Success!", { id: "loading-order" });
      } catch (error) {
        toast.error("Erreur lors du chargement de la commande", {
          id: "loading-order",
        });
        console.error(error);
      }
    };

    fetchOrder();
  }, [searchParams]);

  // ── Fetch communes when wilaya changes ──
  const fetchCommunes = useCallback(async (wilayaId: number) => {
    setLoadingCommunes(true);
    try {
      const res = await fetch(
        `/api/delivery/agencies/noest-express/get-communes?wilaya_id=${wilayaId}`,
      );
      if (!res.ok) throw new Error("Error fetching communes");
      const { communes } = await res.json();
      setCommunes(communes);
    } catch {
      toast.error("Impossible de charger les communes");
    } finally {
      setLoadingCommunes(false);
    }
  }, []);

  // ── Fetch desks when wilaya changes (office delivery) ──
  useEffect(() => {
    if (!formData.wilaya) {
      setDesks([]);
      return;
    }

    const controller = new AbortController();

    (async () => {
      setLoadingDesks(true);
      try {
        const res = await fetch(
          `/api/delivery/agencies/noest-express/get-desks?wilaya_mame=${encodeURIComponent(
            formData.wilaya,
          )}`,
          { signal: controller.signal },
        );
        const data = await res.json();
        setDesks(data.success ? data.desks : []);
      } catch (err: any) {
        if (err.name !== "AbortError") setDesks([]);
      } finally {
        setLoadingDesks(false);
      }
    })();

    return () => controller.abort();
  }, [formData.wilaya]);

  // ── Handlers ──
  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleWilayaChange = async (
    e: React.ChangeEvent<HTMLSelectElement>,
  ) => {
    const wilayaName = e.target.value;
    if(wilayaName === "Tébessa") {
      setFormData(prev => ({...prev , deliveryMethod : "home"}))
    }
    const wilayaObj = ALGERIAN_WILAYAS.find((w) => w.name === wilayaName);

    // Reset dependent fields
    setFormData((prev) => ({
      ...prev,
      wilaya: wilayaName,
      commune: "",
      station_code: "",
    }));

    if (!wilayaObj) {
      setShippingPrice(0);
      return;
    }

    // Fetch communes
    fetchCommunes(Number(wilayaObj.code));

    try {
      setLoadingShipping(true);
      console.log(
        wilayaObj.code,
        formData.deliveryMethod,
        formData.shippingCompany,
      );
      const price = await getShippingPrice({
        wilayaId: Number(wilayaObj.code),
        deliveryType: formData.deliveryMethod, // "home" | "stopdesk"
        shippingCompany: formData.shippingCompany, // "noest-express" | "dhd-express"
      });

      // Update UI / form state
      setShippingPrice(price);

      setFormData((prev) => ({
        ...prev,
        shippingPrice: price,
      }));
    } catch (error) {
      console.error("Failed to fetch shipping price:", error);
      setShippingPrice(0);

      setFormData((prev) => ({
        ...prev,
        shippingPrice: 0,
      }));
    } finally {
      setLoadingShipping(false);
    }
  };

  const handleSignupSubmit = async (): Promise<StoredUser | null> => {
    try {
      const res = await fetch("/api/auth/sign-up", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phoneNumber: formData.phoneNumber,
          name: formData.fullName,
          wilaya: formData.wilaya,
          address: formData.detailedAddress,
          password: formData.password,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Erreur lors de la création du compte");
        return null;
      }

      toast.success("Compte créé avec succès !");
      try {
        localStorage.setItem("isAuthenticated", "true");
        localStorage.setItem("user", JSON.stringify(data.user));
      } catch {
        // localStorage unavailable
      }

      return data.user as StoredUser;
    } catch {
      toast.error("Impossible de créer le compte");
      return null;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    let customerId: string | undefined = user?.id;

    // Create account if password provided
    if (formData.createAccount && formData.password) {
      const newUser = await handleSignupSubmit();
      if (!newUser) return; // signup failed, abort
      customerId = newUser.id;
    }

    if (!customerId) {
      toast.error("Utilisateur non authentifié");
      return;
    }

    setIsProcessing(true);

    const items = cart.map((product : any) => ({
      productId: product.id,
      quantity: product.quantity,
      unitPrice: product.price,
      variantId: product.variantId || null,
      variantName: product.variant
        ? product.variant.attribute || product.variant.color || ""
        : "",
      addons: (product.addons || []).map((addon : any) => ({
        addOnId: addon.id,
        name: addon.translations?.[0]?.name || "Addon",
        unitPrice: addon.price,
        quantity: addon.quantity,
      })),
    }));

    console.log("Items:", items);

    try {
      const response = await fetch("/api/orders/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          total: checkoutSnapshot?.total,
          subtotal: checkoutSnapshot?.subtotal,
          discountTotal: checkoutSnapshot?.discount,
          items,
          customerId,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        router.push(
          `/${ lang }/order-failed?name=${data.fullName}&reason=${
            data.message || "Failed to create order"
          }`,
        );
        return;
      }

      clearCart();
      toast.success("Commande confirmée !");
      router.push(
        `/${ lang }/order-success?name=${data.fullName}&orderId=${data.id}`,
      );
    } catch (error: any) {
      toast.error(error.message || "Une erreur s'est produite");
    } finally {
      setIsProcessing(false);
    }
  };

  async function getShippingPrice({
    wilayaId,
    deliveryType, // "home" | "stopdesk"
    shippingCompany, // "noest-express" | "dhd-express"
    isReturn = false,
  }: {
    wilayaId: number;
    deliveryType: "home" | "stopdesk";
    shippingCompany: "noest-express" | "dhd-express" | any;
    isReturn?: boolean;
  }) {
    if (!wilayaId || !deliveryType || !shippingCompany) {
      throw new Error("Missing shipping parameters");
    }

    const params = new URLSearchParams({
      wilayaId: String(wilayaId),
      deliveryType,
      shippingCompany,
    });

    if (isReturn) {
      params.append("isReturn", "true");
    }

    const res = await fetch(
      `/api/delivery/agencies/noest-express/get-delivery-price?${params.toString()}`,
    );

    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.error || "Failed to fetch shipping price");
    }

    const data = await res.json();

    return data.shippingPrice as number;
  }

  console.log(cart);

  // ── Render ──
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-6 sm:py-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
          {/* ── Left: Form ── */}
          <div className="lg:col-span-2">
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-5">
              Finaliser la commande
            </h1>

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Customer Info */}
              <section className="bg-white rounded-xl shadow-sm p-5 sm:p-6 space-y-4">
                <h2 className="text-base font-semibold text-gray-900">
                  Informations client
                </h2>

                <Field label="Nom complet" required>
                  <input
                    type="text"
                    name="fullName"
                    required
                    value={formData.fullName}
                    onChange={handleInputChange}
                    className={inputClass}
                    placeholder="Votre nom complet"
                  />
                </Field>

                <Field
                  label="Téléphone"
                  required
                  hint="Le numéro doit commencer par 05, 06 ou 07 et contenir 10 chiffres"
                >
                  <input
                    type="tel"
                    name="phoneNumber"
                    required
                    placeholder="0X XX XX XX XX"
                    value={formData.phoneNumber}
                    onChange={handleInputChange}
                    className={inputClass}
                  />
                </Field>
              </section>

              {/* Delivery Method */}
              {!(
                formData.wilaya === "Tébessa" && formData.commune === "Tebessa"
              ) && (
                <section className="bg-white rounded-xl shadow-sm p-5 sm:p-6 space-y-4">
                  <h2 className="text-base font-semibold text-gray-900">
                    Méthode de livraison
                  </h2>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() =>
                        setFormData((prev) => ({
                          ...prev,
                          deliveryMethod: "home",
                          shippingCompany: null,
                          shippingPrice: 900,
                        }))
                      }
                      className={`flex items-start gap-3 p-4 border-2 rounded-xl text-left transition-all ${
                        formData.deliveryMethod === "home"
                          ? "border-teal-500 bg-teal-50"
                          : "border-gray-200 hover:border-teal-300"
                      }`}
                    >
                      <MapPin
                        className={`w-5 h-5 mt-0.5 flex-shrink-0 ${
                          formData.deliveryMethod === "home"
                            ? "text-teal-500"
                            : "text-gray-400"
                        }`}
                      />
                      <div>
                        <div className="font-medium text-gray-900 text-sm">
                          Livraison à domicile
                        </div>
                        <div className="text-xs text-gray-500 mt-0.5">
                          Livraison à votre adresse
                        </div>
                      </div>
                    </button>

                 <button
  type="button"
  disabled={formData.wilaya === "Tébessa"}
  onClick={() => {
    if (formData.wilaya === "Tébessa") return;
    setFormData((prev) => ({
      ...prev,
      deliveryMethod: "stopdesk",
    }));
  }}
  className={`flex items-start gap-3 p-4 border-2 rounded-xl text-left transition-all
    ${
      formData.wilaya === "Tébessa"
        ? "border-gray-200 bg-gray-100 cursor-not-allowed opacity-60"
        : formData.deliveryMethod === "stopdesk"
        ? "border-teal-500 bg-teal-50"
        : "border-gray-200 hover:border-teal-300"
    }
  `}
>
  <Building2
    className={`w-5 h-5 mt-0.5 flex-shrink-0
      ${
        formData.wilaya === "Tébessa"
          ? "text-gray-300"
          : formData.deliveryMethod === "stopdesk"
          ? "text-teal-500"
          : "text-gray-400"
      }
    `}
  />
  <div>
    <div className="font-medium text-gray-900 text-sm">
      Retrait au bureau
    </div>
    <div className="text-xs text-gray-500 mt-0.5">
      Retrait au bureau de livraison
    </div>
    {/* {formData.wilaya === "Tébessa" && (
      <div className="text-xs text-red-500 mt-1">
        Non disponible pour la wilaya de Tébessa
      </div>
    )} */}
  </div>
</button>
                  </div>

                  {/* Shipping Company (office only) */}
                  {/* even domicil will show deliveryAgencies stopdesk = 0 */}
                  <div className="space-y-3 pt-1">
                    <p className="text-sm font-medium text-gray-700">
                      Agence de livraison{" "}
                      <span className="text-red-500">*</span>
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {[
                        {
                          id: "noest-express",
                          name: "Noest Express",
                          desc: "Livraison rapide et fiable",
                        },
                        {
                          id: "dhd-express",
                          name: "DHD Express",
                          desc: "Couverture étendue",
                        },
                      ].map((agency) => (
                        <button
                          key={agency.id}
                          type="button"
                          disabled={agency.id === "dhd-express"}
                          onClick={() =>
                            setFormData((prev) => ({
                              ...prev,
                              shippingCompany: agency.id,
                              shippingPrice: 500,
                            }))
                          }
                          className={`flex items-center gap-3 p-4 border-2 rounded-xl text-left transition-all ${
                            formData.shippingCompany === agency.id
                              ? "border-teal-500 bg-teal-50"
                              : "border-gray-200 hover:border-teal-300"
                          }`}
                        >
                          <Truck
                            className={`w-5 h-5 flex-shrink-0 ${
                              formData.shippingCompany === agency.id
                                ? "text-teal-500"
                                : "text-gray-400"
                            }`}
                          />
                          <div>
                            <div className="font-medium text-gray-900 text-sm">
                              {agency.name}
                            </div>
                            <div className="text-xs text-gray-500 mt-0.5">
                              {agency.desc}
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                </section>
              )}

              {/* Location */}
              <section className="bg-white rounded-xl shadow-sm p-5 sm:p-6 space-y-4">
                <h2 className="text-base font-semibold text-gray-900">
                  Localisation
                </h2>

                {/* Wilaya */}
                <Field label="Wilaya" required>
                  <div className="relative">
                    <select
                      value={formData.wilaya}
                      onChange={handleWilayaChange}
                      required
                      className={`${inputClass} appearance-none pr-10`}
                    >
                      <option value="">Sélectionner votre wilaya</option>
                      {ALGERIAN_WILAYAS.map((wilaya) => (
                        <option key={wilaya.code} value={wilaya.name}>
                          {wilaya.code} - {wilaya.name}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                  </div>

                  {formData.wilaya !== "Tébessa" && formData.wilaya && (
                    <div className="mt-2">
                      {loadingShipping ? (
                        <div className="flex items-center gap-2 text-sm text-gray-500 bg-gray-50 border border-gray-200 px-3 py-2 rounded-lg">
                          <Truck className="w-4 h-4 animate-pulse" />
                          Calcul du prix de livraison…
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 text-sm text-teal-700 bg-teal-50 border border-teal-200 px-3 py-2 rounded-lg">
                          <Truck className="w-4 h-4 flex-shrink-0" />
                          Livraison vers{" "}
                          <span className="font-semibold">
                            {formData.wilaya}
                          </span>{" "}
                          :{" "}
                          <span className="font-bold">
                            {formData.shippingPrice.toLocaleString()} DA
                          </span>
                        </div>
                      )}
                    </div>
                  )}
                </Field>

                {/* Commune (home delivery) */}

                <Field label="Commune" required>
                  <div className="relative">
                    <select
                      name="commune"
                      required
                      value={formData.commune}
                      onChange={handleInputChange}
                      disabled={loadingCommunes || !formData.wilaya}
                      className={`${inputClass} appearance-none pr-10 disabled:opacity-50 disabled:cursor-not-allowed`}
                    >
                      <option value="">
                        {loadingCommunes
                          ? "Chargement…"
                          : !formData.wilaya
                            ? "Sélectionnez une wilaya d'abord"
                            : "Choisir une commune"}
                      </option>
                      {communes.map((commune, index) => (
                        <option key={index} value={commune.nom}>
                          {commune.nom}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                  </div>
                </Field>
                {/* )} */}

                {formData.wilaya === "Tébessa" &&
                  formData.commune === "Tebessa" && (
                    <div className="flex items-start gap-3 rounded-lg border border-yellow-200 bg-yellow-50 px-4 py-3">
                      <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />

                      <div className="text-sm">
                        <p className="font-medium text-yellow-700">
                          Delivery Fee Notice : Tebessa / Tebessa only !
                        </p>
                        <p className="text-yellow-600">
                          <span className="font-medium">Free:</span> when you go
                          to the delivery person.
                          <br />
                          <span className="font-medium">150–300 Da:</span> when
                          the delivery person calls you and comes to your home.
                          <br />
                          <span className="italic">Status: Pending</span>
                        </p>
                        <div className="mt-3 flex gap-2 flex-wrap gap-2">
                          <div className="flex gap-2">
                            <div className="flex gap-4">
                              {/* FREE */}
                           <button
  type="button"
  onClick={() => {
    setShippingOption("FREE");
    setFormData((prev) => ({
      ...prev,
      shippingPrice: 0,
    }));
  }}
  className={`rounded-lg px-4 py-2 text-sm font-medium transition-all duration-200
    focus:outline-none
    ${
      shippingOption === "FREE"
        ? "bg-green-600 text-white shadow-md ring-2 ring-green-500 ring-offset-2"
        : "bg-white text-gray-500 shadow-sm hover:shadow-md hover:-translate-y-[1px]"
    }`}
>
  Gratuit
</button>

<button
  type="button"
  onClick={() => {
    setShippingOption("PAID");
    setFormData((prev) => ({
      ...prev,
      shippingPrice: 0,
    }));
  }}
  className={`rounded-lg px-4 py-2 text-sm font-medium transition-all duration-200
    focus:outline-none
    ${
      shippingOption === "PAID"
        ? "bg-yellow-500 text-white shadow-md ring-2 ring-yellow-400 ring-offset-2"
        : "bg-white text-gray-500 shadow-sm hover:shadow-md hover:-translate-y-[1px]"
    }`}
>
  150 – 300 DA
</button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                {/* Station (office delivery) */}
                {formData.deliveryMethod === "stopdesk" &&
                  formData.wilaya !== "Tébessa" && (
                    <Field label="Station (Stop Desk)" required>
                      <div className="relative">
                        <select
                          name="station_code"
                          required
                          value={formData.station_code}
                          onChange={handleInputChange}
                          disabled={loadingDesks || !formData.wilaya}
                          className={`${inputClass} appearance-none pr-10 disabled:opacity-50 disabled:cursor-not-allowed`}
                        >
                          <option value="">
                            {loadingDesks
                              ? "Chargement…"
                              : !formData.wilaya
                                ? "Sélectionnez une wilaya d'abord"
                                : "Choisir une station"}
                          </option>
                          {desks.map((desk, index) => (
                            <option key={desk.code || index} value={desk.code}>
                              {desk.name} — {desk.address}
                            </option>
                          ))}
                        </select>
                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                      </div>
                    </Field>
                  )}
              </section>

              {/* Detailed Address (home only) */}
              {formData.deliveryMethod === "home" && (
                <section className="bg-white rounded-xl shadow-sm p-5 sm:p-6">
                  <Field label="Adresse détaillée" required>
                    <textarea
                      name="detailedAddress"
                      required
                      rows={3}
                      placeholder="Numéro, rue, cité, résidence…"
                      value={formData.detailedAddress}
                      onChange={handleInputChange}
                      className={textareaClass}
                    />
                  </Field>
                </section>
              )}

              {/* Notes */}
              <section className="bg-white rounded-xl shadow-sm p-5 sm:p-6 space-y-4">
                <h2 className="text-base font-semibold text-gray-900">Notes</h2>

                <Field label="Note pour le confirmateur" optional>
                  <textarea
                    name="orderNote"
                    rows={2}
                    placeholder="Notes spéciales pour la commande…"
                    value={formData.orderNote}
                    onChange={handleInputChange}
                    className={textareaClass}
                  />
                </Field>

                <Field label="Note sur l'horaire de livraison" optional>
                  <textarea
                    name="deliveryNote"
                    rows={2}
                    placeholder="Ex: Livraison après 14h"
                    value={formData.deliveryNote}
                    onChange={handleInputChange}
                    className={textareaClass}
                  />
                </Field>
              </section>

              {/* Create Account */}
              {!isAuthenticated && (
                <section className="bg-teal-50 border border-teal-200 rounded-xl p-5 sm:p-6">
                  <div className="flex items-start gap-3 mb-4">
                    <input
                      type="checkbox"
                      id="createAccount"
                      name="createAccount"
                      checked={formData.createAccount}
                      onChange={handleInputChange}
                      className="w-4.5 h-4.5 text-teal-600 border-gray-300 rounded focus:ring-teal-500 mt-0.5 cursor-pointer"
                    />
                    <div>
                      <label
                        htmlFor="createAccount"
                        className="font-medium text-gray-900 text-sm cursor-pointer"
                      >
                        Créer un compte{" "}
                        <span className="text-gray-400 font-normal">
                          (optionnel)
                        </span>
                      </label>
                      <p className="text-xs text-gray-500 mt-1">
                        Enregistrez vos informations et suivez facilement vos
                        commandes
                      </p>
                      <ul className="text-xs text-teal-700 mt-2 space-y-1">
                        <li className="flex items-center gap-1.5">
                          <CheckCircle className="w-3.5 h-3.5" />
                          Suivre vos commandes
                        </li>
                        <li className="flex items-center gap-1.5">
                          <CheckCircle className="w-3.5 h-3.5" />
                          Réorganiser rapidement
                        </li>
                        <li className="flex items-center gap-1.5">
                          <CheckCircle className="w-3.5 h-3.5" />
                          Offres spéciales
                        </li>
                      </ul>
                    </div>
                  </div>

                  {formData.createAccount && (
                    <Field
                      label="Mot de passe"
                      required
                      hint="Votre compte sera créé automatiquement après confirmation"
                    >
                      <input
                        type="password"
                        name="password"
                        placeholder="Au moins 6 caractères"
                        minLength={6}
                        value={formData.password}
                        onChange={handleInputChange}
                        className={inputClass}
                      />
                    </Field>
                  )}
                </section>
              )}

              {/* Submit */}
              <button
                type="submit"
                // disabled={isProcessing}
                className="w-full bg-teal-500 hover:bg-teal-600 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold py-3.5 px-6 rounded-xl transition-all shadow-md hover:shadow-lg text-sm flex items-center justify-center gap-2"
              >
                {isProcessing ? (
                  <Loader />
                ) : isEdit ? (
                  "Update"
                ) : (
                  "Confirmer la commande"
                )}
              </button>
            </form>
          </div>

          {/* ── Right: Order Summary ── */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6 sticky top-24">
              <h2 className="text-lg font-bold text-gray-900 mb-5">
                Résumé de la commande
              </h2>

              {/* Cart items */}
              <div className="space-y-3 mb-5 max-h-60 overflow-y-auto pr-1">
                {cart.map((item : any) => (
                  <div
                    key={`${item.id}-${item.variantId ?? ""}`}
                    className="flex justify-between gap-2 text-sm"
                  >
                    <span className="text-gray-600 line-clamp-2">
                      <span className="font-medium text-gray-800">
                        {item.quantity}×
                      </span>{" "}
                      {
                        getTranslations(
                          item.translations,
                           lang ,
                          "name",
                        ) as string
                      }
                    </span>
                    <span className="font-semibold text-gray-900 whitespace-nowrap">
                      {(item.price * item.quantity).toLocaleString()} DA
                    </span>
                  </div>
                ))}
              </div>

              {/* Price breakdown */}
              <div className="space-y-2.5 pt-4 border-t border-gray-100 text-sm">
                <div className="flex justify-between text-gray-600">
                  <span>Sous-total</span>
                  <span className="font-semibold text-gray-900">
                    {subtotal.toLocaleString()} DA
                  </span>
                </div>

                {discount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Réduction</span>
                    <span className="font-semibold">
                      − {discount.toLocaleString()} DA
                    </span>
                  </div>
                )}

                <div className="flex justify-between text-gray-600">
                  <span>Livraison</span>
                  <span className="font-semibold text-gray-900">
                    + {formData.shippingPrice.toLocaleString()} DA
                  </span>
                </div>

                <div className="flex justify-between text-base font-bold pt-3 border-t border-gray-100">
                  <span>Total</span>
                  <span className="text-teal-600">
                    {(total + formData.shippingPrice).toLocaleString()} DA
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
