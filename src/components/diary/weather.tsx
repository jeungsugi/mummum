import { useState, useEffect } from "react";
import { useAppDispatch, useAppSelector } from "../../redux/reduxStore";
// import { useNavigate } from "react-router-dom";
import useGeolocation from "react-hook-geolocation";
import axios from "axios";
import { mainDust } from "../../redux/slices/mainSlice/mainPageSlice";
import { mainCity } from "../../redux/slices/mainSlice/mainCitySlice";
import supabase from "../../store";

interface CityDataList {
  cityName: string;
  cityNameEng: string;
  coValue: string;
  dataGubun: string;
  dataTime: string;
  districtCode: string;
  districtNumSeq: string;
  itemCode: string;
  khaiValue: string;
  no2Value: string;
  numOfRows: string;
  o3Value: string;
  pageNo: string;
  pm10Value: string;
  pm25Value: string;
  resultCode: string;
  resultMsg: string;
  returnType: string;
  searchCondition: string;
  serviceKey: string;
  sidoName: string;
  so2Value: string;
  totalCount: string;
}
interface Address {
  address_name: string;
  region_1depth_name: string;
  region_2depth_name: string;
  region_3depth_name: string;
  mountain_yn: string;
  main_address_no: string;
  sub_address_no: string;
  zip_code: string;
}
interface ResultItem {
  address: Address;
}
interface DogNameType {
  uuid: string;
  dogname: string;
}

const Weather = () => {
  const userUid = useAppSelector((state) => state.userLogin.userId);
  const dustList = useAppSelector((state) => state.mainDust.response);
  const addressName = useAppSelector((state) => state.mainCity.cName);
  const [myDogName, setMyDogName] = useState<DogNameType[]>([]);

  const dispatch = useAppDispatch();

  //미세먼지
  const [checkData, setCheckData] = useState<string[]>([]);

  const URL =
    "https://apis.data.go.kr/B552584/ArpltnStatsSvc/getCtprvnMesureSidoLIst";
  const SERVICE_KEY =
    "Y1TEjuVO5hEMU0yG1YY7J9dJvRQbv+87/sewOQKgQa9JnI2l9Xyj/Zm5gnvsy1Hu/BVCW3WofoTKePCW1ZTrkA==";

  const handleDogName = async () => {
    const { data, error } = await supabase.from("dognamedb").select("*");
    if (data) {
      setMyDogName(data);
    } else {
      console.log(error);
    }
  };
  const fetchData = async () => {
    try {
      const response = await axios.get(URL, {
        params: {
          serviceKey: SERVICE_KEY,
          returnType: "json",
          numOfRows: 25,
          pageNo: 1,
          sidoName: "서울",
          searchCondition: "HOUR",
        },
      });
      dispatch(mainDust(response.data.response.body.items));
      handleComparison();
    } catch (error) {
      console.log(error);
    }
  };

  const geolocation = useGeolocation();
  const latitude = geolocation.latitude;
  const longitude = geolocation.longitude;
  // const { kakao } = window;
  const geocoder = new kakao.maps.services.Geocoder();
  const coord = new kakao.maps.LatLng(latitude, longitude);

  const handleGeocoder = async () => {
    const callback = async function (result: ResultItem[], status: string) {
      if (status === kakao.maps.services.Status.OK) {
        const adr = result[0].address.region_2depth_name;
        await dispatch(mainCity(adr));
      }
    };

    geocoder.coord2Address(coord.getLng(), coord.getLat(), callback);
  };

  const handleComparison = () => {
    dustList.map((item: CityDataList) => {
      if (item.cityName === addressName) {
        const list = [item.cityName, item.pm10Value, item.pm25Value];
        setCheckData(list);
      }
    });
  };

  useEffect(() => {
   
    handleDogName();
  }, []);

  useEffect(() => {
    const fetchData_list = async () => {
      await fetchData();
    };
    fetchData_list();
    if (latitude && longitude) {
      handleGeocoder();
    }
  }, [latitude, longitude]);

  return (
    <section className="">
      <div className="flex flex-col justify-evenly w-60 h-40 bg-[#222] opacity-80 text-white rounded-[14px] ">
        <>
          {myDogName.map((item) =>
            item.uuid === userUid ? (
              <h3 key={item.uuid} className="text-xl text-center m-0">
                {item.dogname}
              </h3>
            ) : (
              <div className="hidden"></div>
            )
          )}
        </>
        <h3 className="text-center m-0 ">{addressName}</h3>
        <div className="flex justify-around">
          <div>미세먼지</div>

          <div>
            {Number(checkData[1]) <= 30
              ? "좋음"
              : 31 <= Number(checkData[1]) && Number(checkData[1]) <= 80
              ? "보통"
              : 81 <= Number(checkData[1]) && Number(checkData[1]) <= 150
              ? "나쁨"
              : "매우나쁨"}
          </div>
        </div>
        <div className="flex justify-around">
          <div>초 미세먼지</div>
          <div>
            {Number(checkData[2]) <= 15
              ? "좋음"
              : 16 <= Number(checkData[2]) && Number(checkData[1]) <= 35
              ? "보통"
              : 36 <= Number(checkData[2]) && Number(checkData[1]) <= 75
              ? "나쁨"
              : "매우나쁨"}
          </div>
        </div>
        <div>{}</div>
      </div>
    </section>
  );
};

export default Weather;
