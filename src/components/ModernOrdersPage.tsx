import { useState } from "react";

export default function ModernOrdersPage() {
  const [deliveryType, setDeliveryType] = useState("Entrega");
  const [payment, setPayment] = useState("");

  const deliveryPayments = [
    "Cartão Virtual Débito",
    "Cartão Virtual Crédito",
    "Pix",
  ];

  const pickupPayments = [
    "Cartão Crédito",
    "Cartão Débito",
    "Dinheiro",
    "Pix",
  ];

  const paymentOptions =
    deliveryType === "Entrega"
      ? deliveryPayments
      : pickupPayments;

  return (
    <div className="min-h-screen bg-gray-100 pb-28">

      <div className="bg-green-700 text-white p-5 rounded-b-3xl">
        <h1 className="text-3xl font-bold">
          Novo Pedido
        </h1>

        <p className="text-green-100 mt-1">
          Revise antes de enviar à loja
        </p>
      </div>

      <div className="p-4 space-y-4">

        <div className="bg-white rounded-3xl p-4 shadow">

          <h2 className="font-bold text-xl mb-4">
            Entrega ou Retirada
          </h2>

          <div className="grid grid-cols-2 gap-3">

            <button
              onClick={() => setDeliveryType("Entrega")}
              className={`p-4 rounded-2xl border-2 ${
                deliveryType === "Entrega"
                  ? "bg-green-50 border-green-600"
                  : "border-gray-200"
              }`}
            >
              🚚
              <div className="font-bold mt-2">
                Entrega
              </div>

              <div className="text-sm text-gray-500">
                Receber no endereço
              </div>
            </button>

            <button
              onClick={() => setDeliveryType("Retirada")}
              className={`p-4 rounded-2xl border-2 ${
                deliveryType === "Retirada"
                  ? "bg-green-50 border-green-600"
                  : "border-gray-200"
              }`}
            >
              🛍
              <div className="font-bold mt-2">
                Retirada
              </div>

              <div className="text-sm text-gray-500">
                Buscar na loja
              </div>
            </button>

          </div>
        </div>

        <div className="bg-white rounded-3xl p-4 shadow">

          <h2 className="font-bold text-xl mb-4">
            Forma de Pagamento
          </h2>

          <div className="space-y-2">

            {paymentOptions.map((item) => (
              <button
                key={item}
                onClick={() => setPayment(item)}
                className={`w-full p-4 rounded-2xl border-2 flex justify-between ${
                  payment === item
                    ? "bg-green-50 border-green-600"
                    : "border-gray-200"
                }`}
              >
                <span>{item}</span>

                {payment === item && (
                  <span>✅</span>
                )}
              </button>
            ))}

          </div>
        </div>

        <div className="bg-white rounded-3xl p-4 shadow">

          <h2 className="font-bold text-xl mb-4">
            Perfil da Loja
          </h2>

          <div className="flex gap-4">

            <img
              src="https://images.unsplash.com/photo-1542838132-92c53300491e?q=80&w=400"
              className="w-20 h-20 rounded-2xl object-cover"
            />

            <div>

              <h3 className="font-bold text-lg">
                Hortifruti do João
              </h3>

              <p className="text-green-700">
                Proprietário: João Silva
              </p>

              <p className="text-gray-500 text-sm mt-2">
                Maceió - AL - Brasil
              </p>

              <p className="text-gray-500 text-sm">
                Entrega disponível
              </p>

            </div>

          </div>

        </div>

        <div className="bg-white rounded-3xl p-4 shadow">

          <h2 className="font-bold text-xl mb-4">
            Perfil do Cliente
          </h2>

          <div className="flex gap-4">

            <img
              src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=400"
              className="w-20 h-20 rounded-full object-cover"
            />

            <div>

              <h3 className="font-bold text-lg">
                Maria Souza
              </h3>

              <p className="text-gray-500 text-sm mt-2">
                Jatiúca - Maceió - AL
              </p>

              <p className="text-gray-500 text-sm">
                Cliente cadastrado
              </p>

            </div>

          </div>

        </div>

        <div className="bg-white rounded-3xl p-4 shadow">

          <h2 className="font-bold text-xl mb-4">
            Produtos do Pedido
          </h2>

          <div className="space-y-4">

            <div className="flex gap-4">

              <img
                src="https://images.unsplash.com/photo-1546094096-0df4bcaaa337?q=80&w=400"
                className="w-20 h-20 rounded-2xl object-cover"
              />

              <div className="flex-1">

                <h3 className="font-bold">
                  Tomate Salada
                </h3>

                <p className="text-sm text-gray-500">
                  Peso: 1,5 kg
                </p>

                <p className="text-sm text-gray-500">
                  Quantidade: 2
                </p>

              </div>

              <div className="font-bold text-green-700">
                R$ 12,90
              </div>

            </div>

          </div>

        </div>

        <div className="bg-white rounded-3xl p-4 shadow">

          <h2 className="font-bold text-xl mb-4">
            Resumo
          </h2>

          <div className="space-y-2">

            <div className="flex justify-between">
              <span>Itens</span>
              <span>12</span>
            </div>

            <div className="flex justify-between">
              <span>Peso</span>
              <span>8,4 kg</span>
            </div>

            <div className="flex justify-between">
              <span>Total</span>
              <span>R$ 78,60</span>
            </div>

          </div>

          <button className="w-full mt-5 bg-green-700 text-white py-4 rounded-2xl font-bold">
            ENVIAR PEDIDO À LOJA
          </button>

          <button className="w-full mt-3 border border-red-400 text-red-500 py-4 rounded-2xl font-bold">
            CANCELAR PEDIDO
          </button>

        </div>

      </div>

    </div>
  );
          }
