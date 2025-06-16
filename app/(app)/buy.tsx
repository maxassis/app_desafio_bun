import { useState } from "react";
import {
  View,
  Text,
  SafeAreaView,
  Image,
  TouchableOpacity,
  ImageBackground,
  ScrollView,
} from "react-native";
import { useRouter } from "expo-router";
import Left from "../../assets/arrow-left.svg";
import Track from "../../assets/track.svg";
import Carousel from "react-native-reanimated-carousel";
import { Dimensions } from "react-native";
import { LinearGradient } from "expo-linear-gradient";

const buyData = {
  name: "Desafio Cidade Maravilhosa",
  backgroundPhoto:
    "https://yvievpygnysrufdcakbz.supabase.co/storage/v1/object/public/desafios//f78f5525-2ef6-48d5-85e8-232bc846344b-20241207-ArraialdoCabo_PT-BR0624214500_UHD.jpg",
  photos: [
    "https://yvievpygnysrufdcakbz.supabase.co/storage/v1/object/public/avatars//cmalo7ke2000099vb6mj80lum-1747102632973.jpeg",
    "https://yvievpygnysrufdcakbz.supabase.co/storage/v1/object/public/avatars//cmaprckxh0000997gx4xocpy2-1747337080499.jpeg",
    "https://yvievpygnysrufdcakbz.supabase.co/storage/v1/object/public/avatars//cmazouwxc000099vn6guahnap-1748299775503.jpeg",
    "https://yvievpygnysrufdcakbz.supabase.co/storage/v1/object/public/avatars//cmaiq90xs000099osfult7dzq-1747336639187.jpeg",
  ],
  shortDescription:
    "150 km virtuais pelos pontos turísticos mais icônicos do Rio 🧡",
  description:
    "Bem-vindo ao Desafio Cidade Maravilhosa, uma jornada única que leva você a percorrer virtualmente 150 km pelos pontos mais icônicos e deslumbrantes do Rio de Janeiro! Este desafio é uma oportunidade imperdível para corredores de todos os níveis, proporcionando uma experiência enriquecedora e motivadora enquanto você se mantém ativo e saudável",
  trackPhoto:
    "https://www.google.com/maps/d/u/0/edit?mid=1GZx3Xyv5RzJ8z8l5r0aRfM4r5b2&usp=sharing",
  howParticipate:
    "Para participar, inscreva-se agora e pague a taxa de inscrição. Após a confirmação do pagamento, você estará oficialmente inscrito e pronto para iniciar sua jornada. Lembre-se de confirmar seu endereço para receber os itens de recompensa ao final do desafio.",
  price: "30,00",
  benefits: [
    "Camisa: Uma camisa exclusiva do Desafio Cidade Maravilhosa 150km.",
    "Garrafa personalizada: Uma garrafa d'água personalizada do desafio.",
    "Medalha de conclusão: Após completar 100% do desafio, solicite e receba em casa sua medalha de finisher.",
    "Ranking e Perfil Social: A todo momento acompanhe seu progresso e compare seu desempenho com outros participantes.",
  ],
  rules: [
    "Inscreva-se no desafio pelo valor de R$ 120,00, e aguarde a chegada do seu Kit starter no endereço informado.",
    "Rastreie sua atividade de corrida ou caminhada através de dispositivos e aplicativos compatíveis, como smartwatches e Strava.",
    "Cada quilometro importa! As distâncias acumuladas serão automaticamente registradas no mapa do desafio.",
    "Mantenha sua rotina de exercícios até concluir todo o desafio. Ao final do desafio, você poderá reivindicar o seu Kit finisher e compartilhar com o mundo a sua conquista.",
  ],
};

export default function Buy() {
  const router = useRouter();
  const [show, setShow] = useState(false);

  const screenWidth = Dimensions.get("window").width;
  const [currentIndex, setCurrentIndex] = useState(0);

  return (
    <SafeAreaView className="flex-1">
      <ScrollView overScrollMode="never">
        <ImageBackground
          className="px-5"
          source={{ uri: buyData.backgroundPhoto }}
          style={{ position: "relative" }}
        >
          <LinearGradient
            colors={["transparent", "white"]}
            style={{
              position: "absolute",
              bottom: 0,
              left: 0,
              right: 0,
              height: 250, 
              zIndex: 0,
            }}
          />

          <View style={{ zIndex: 1 }}>
            <View className="mt-[35px]">
              <TouchableOpacity
                onPress={() => router.push("/dashboard")}
                className="h-[43px] w-[43px] rounded-full bg-bondis-text-gray justify-center items-center"
              >
                <Left />
              </TouchableOpacity>
            </View>

            <View className="w-full h-[374px] mt-4 bg-white rounded-t-3xl px-4 pt-3 justify-center items-center">
              <View className="w-full h-full rounded-2xl overflow-hidden">
                <Carousel
                  width={screenWidth - 60}
                  height={340}
                  data={buyData.photos}
                  scrollAnimationDuration={500}
                  loop={false}
                  onSnapToItem={(index) => setCurrentIndex(index)}
                  renderItem={({ item }) => (
                    <Image
                      source={{ uri: item }}
                      resizeMode="cover"
                      className="w-full h-full"
                    />
                  )}
                />
              </View>
            </View>
          </View>
        </ImageBackground>

        <Text className="text-center text-bondis-gray-secondary text-xs mt-8 mb-16px">
          Arraste para o lado para ver mais imagens
        </Text>

        <View className="flex-row justify-center mt-4">
          {buyData.photos.map((_, index) => (
            <View
              key={index}
              className={`h-2 w-2 mx-[2px] rounded-full ${
                index === currentIndex ? "bg-bondis-green" : "bg-[#C4C4C4]"
              }`}
            />
          ))}
        </View>

        <Text className="text-center mt-[51px] text-2xl font-inter-bold">
          {buyData.name}
        </Text>

        <Text className="text-base text-bondis-gray-dark text-center mt-4 mx-5">
          {buyData.shortDescription}
        </Text>

        <View className="flex-row flex-wrap gap-3 mx-5 mt-4">
          <View className="h-[37px] ml-5 rounded-full flex-row justify-center items-center gap-x-2 bg-bondis-text-gray px-4">
            <Track />
            <Text>150Km</Text>
          </View>

          <View className="h-[37px] ml-5 rounded-full flex-row justify-center items-center gap-x-2 bg-bondis-text-gray px-4">
            <Track />
            <Text>520 Desafios finalizados</Text>
          </View>

          <View className="h-[37px] ml-5 rounded-full flex-row justify-center items-center gap-x-2 bg-bondis-text-gray px-4">
            <Track />
            <Text>Ideal para corrida e caminhada</Text>
          </View>
        </View>

        {!show && (
          <TouchableOpacity
            onPress={() => setShow(!show)}
            className="h-[52px] bg-bondis-green mt-[45px] mb-8 rounded-full justify-center mx-5"
          >
            <Text className="text-center font-inter-bold text-base">
              Quero escolher meu kit
            </Text>
          </TouchableOpacity>
        )}

        {show && (
          <View>
            <Text className="mx-5 mt-8 text-base font-inter-bold">
              Descrição:
            </Text>

            <Text className="mx-5 mt-4 text-base text-left">
              {buyData.description}
            </Text>

            <View className="mx-5 mt-8 p-4 border-[1px] border-[#D9D9D9] rounded-md">
              <Text className="text-base font-inter-bold mb-[10px]">
                Percurso
              </Text>
              <Image
                className="w-full"
                source={require("../../assets/map.png")}
              />
            </View>

            <View className="mx-5 mt-8 p-4 border-[1px] border-[#D9D9D9] rounded-md">
              <Text className="text-base font-inter-bold mb-[10px]">
                Como participar?
              </Text>
              <Text className="text-base text-bondis-gray-dark text-left">
                {buyData.howParticipate}
              </Text>

              <Text className="text-base text-bondis-gray-dark mt-8">
                Preço: R$ {buyData.price}
              </Text>
            </View>

            <View className="mx-5 mt-8 p-4 border-[1px] border-[#D9D9D9] rounded-md">
              <Text className="text-base font-inter-bold mb-[10px]">
                Benefícios
              </Text>

              {buyData.benefits.map((benefit, index) => (
                <Text
                  key={index}
                  className={`text-base text-bondis-gray-dark text-left ${
                    index !== 0 ? "mt-6" : ""
                  }`}
                >
                  {benefit}
                </Text>
              ))}
            </View>

            <View className="mx-5 mt-8 p-4 border-[1px] border-[#D9D9D9] rounded-md">
              <Text className="text-base font-inter-bold mb-[10px]">
                Regras
              </Text>

              {buyData.rules.map((rule, index) => (
                <Text
                  key={index}
                  className={`text-base text-bondis-gray-dark text-left ${
                    index !== 0 ? "mt-6" : ""
                  }`}
                >
                  {`${index + 1}. ${rule}`}
                </Text>
              ))}
            </View>

            <TouchableOpacity className="h-[52px] bg-bondis-green mt-[45px] mb-4 rounded-full justify-center mx-5">
              <Text className="text-center font-inter-bold text-base">
                Aceito o desafio 💪
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
