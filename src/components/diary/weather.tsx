import { useState, useEffect } from "react";
import { useAppDispatch, useAppSelector } from "../../redux/reduxStore";
import { useNavigate } from "react-router-dom";
import useGeolocation from "react-hook-geolocation";
import axios from "axios";
import supabase from "../../store";

type CityData = {
  response: {
    body: {
      totalCount: number;
      items: {
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
      }[];
    };
  };
};
const initialDataUrl: CityData = {
  response: {
    body: {
      totalCount: 0,
      items: [],
    },
  },
};
interface CityPm {
  cityName: string;
  pm10Value: string;
  pm25Value: string;
}

const Weather = () => {
  const [myDogName, setMyDogName] = useState("");
  const [addressName, setAddressName] = useState("");
  const [loading, setLoading] = useState(true);

  //미세먼지
  const [dataUrl, setDataUrl] = useState<CityData>(initialDataUrl);
  const [cityData, setCityData] = useState<CityPm[]>([]);
  const [checkData, setCheckData] = useState<string[]>([]);

  //프로필 이미지
  const [pofilImg, setProfilImg] = useState("");

  const URL =
    "http://apis.data.go.kr/B552584/ArpltnStatsSvc/getCtprvnMesureSidoLIst";
  const SERVICE_KEY =
    "8HRm1o68X5CSUrMEIAk6vFK2Fgi%2F1un6PVwE%2Bn0%2BwixdBFO%2F";

  const geolocation = useGeolocation();
  const latitude = geolocation.latitude;
  const longitude = geolocation.longitude;

  const handleDogName = async () => {
    const { data, error } = await supabase.from("dognamedb").select("dogname");
    if (data) {
      setMyDogName(data[0].dogname);
    } else {
      console.log(error);
    }
    // console.log(myDogName);
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
      console.log("fetchData called2222222222");
      setDataUrl(response.data);
    } catch (error) {
      console.log(error);
    }
  };

  const handleGeocoder = async () => {
    const geocoder = new window.kakao.maps.services.Geocoder();
    const coord = new window.kakao.maps.LatLng(latitude, longitude);
    const callback = async function (result: any, status: string) {
      if (status === window.kakao.maps.services.Status.OK) {
        const adr = result[0].address.region_2depth_name;
        await setAddressName(adr);
      }
    };
    setLoading(false);
    geocoder.coord2Address(coord.getLng(), coord.getLat(), callback);
  };

  const handleData = async () => {
    if (dataUrl !== null) {
      const itemsList = dataUrl.response.body.items;
      const newData = itemsList.map((item: CityPm) => {
        const { cityName, pm10Value, pm25Value } = item;
        return {
          cityName,
          pm10Value,
          pm25Value,
        };
      });
      setCityData(newData);
    }
  };

  const handleComparison = () => {
    cityData.map((item) => {
      if (item.cityName === addressName) {
        const list = [item.cityName, item.pm10Value, item.pm25Value];
        setCheckData(list);
      }
    });
  };

  useEffect(() => {
    handleGeocoder();
    handleDogName();
    fetchData();
  }, []);

  useEffect(() => {
    handleData();
  }, [dataUrl]);

  useEffect(() => {
    console.log(cityData);
    handleComparison();
  }, [cityData]);

  useEffect(() => {
    handleGeocoder();
  }, [loading]);

  const handleImgUpload = async (event: any) => {
    const avatarFile = event.target.files[0];
    const fileName = avatarFile.name;
    const { data, error } = await supabase.storage
      .from("imgProfil")
      .upload(`/profil/${fileName}`, avatarFile, {
        cacheControl: "3600",
        upsert: false,
      });
  };

  return (
    <section>
      <div
        style={{
          background: "#d9d9d9",
          width: "150px",
          height: "150px",
          borderRadius: "100%",
          textAlign: "center",
          margin: "auto",
          display: "flex",
          justifyContent: "center",
        }}
      >
        <div
          style={{
            background: "#f1f1f1",
            width: "50px",
            height: "50px",
            borderRadius: "100%",
            textAlign: "center",
            margin: "auto",
          }}
        >
          <input type="file" accept="img/*" onChange={handleImgUpload} />
        </div>
      </div>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-evenly",
          width: "250px",
          height: "150px",
          background: "#222",
          opacity: "80%",
          color: "#fff",
          borderRadius: "14px",
          marginTop: "-20px",
        }}
      >
        <h3
          style={{
            fontSize: "20px",
            fontWeight: "normal",
            textAlign: "center",
            margin: "0px",
          }}
        >
          {myDogName}
        </h3>
        <div style={{ display: "flex", justifyContent: "space-around" }}>
          <div>미세먼지</div>
          <div>
            {Number(checkData[1]) <= 30
              ? "좋음"
              : 31 < Number(checkData[1]) && Number(checkData[1]) <= 80
              ? "보통"
              : 81 < Number(checkData[1]) && Number(checkData[1]) <= 150
              ? "나쁨"
              : "매우나쁨"}
          </div>
        </div>
        <div style={{ display: "flex", justifyContent: "space-around" }}>
          <div>초 미세먼지</div>
          <div>
            {Number(checkData[2]) <= 15
              ? "좋음"
              : 16 < Number(checkData[2]) && Number(checkData[1]) <= 35
              ? "보통"
              : 36 < Number(checkData[2]) && Number(checkData[1]) <= 75
              ? "나쁨"
              : "매우나쁨"}
          </div>
        </div>
        <div>{addressName}</div>
      </div>
    </section>
  );
};

export default Weather;