import React, { useState } from "react";
import axios from "axios";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Button } from "../ui/button";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { FaRegStar } from "react-icons/fa";


export default function Hero() {
    const [location, setLocation] = useState("");
    const [suggestions, setSuggestions] = useState([]);
    const [days, setDays] = useState("");
    const [budget, setBudget] = useState("");
    const [people, setPeople] = useState("");
    const [tripPlan, setTripPlan] = useState("");
    const [loading, setLoading] = useState();
    const apiKey = import.meta.env.VITE_API_KEY;

    const handleLocationChange = async (e) => {
        const query = e.target.value;
        setLocation(query);

        if (query.length > 2) {
            try {
                const response = await axios.get(
                    `https://nominatim.openstreetmap.org/search?format=json&q=${query}`
                );
                setSuggestions(response.data);
            } catch (error) {
                console.error("Error fetching suggestions:", error);
            }
        } else {
            setSuggestions([]);
        }
    };

    const handleSuggestionSelect = (suggestion) => {
        setLocation(suggestion.display_name);
        setSuggestions([]);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        const prompt = `Generate Travel Plan for Location: ${location}, for ${days} Days for ${people} with a ${budget} budget. Give me a Hotels options list with Hotel Name, Hotel Address, Price in INR, Hotel Image URL, Geo Coordinates, Rating, Descriptions, and suggest itinerary with Place Name, Place Details, Place Image URL, Geo Coordinates, Ticket Pricing, Time to travel each of the locations for ${days} days with each day plan with the best time to visit in JSON format.`;

        try {
            const generationConfig = {
                temperature: 1,
                topP: 0.95,
                topK: 64,
                maxOutputTokens: 8192,
                responseMimeType: "application/json",
            };

            const chatSession = model.startChat({
                generationConfig,
                history: [
                    {
                        role: "user",
                        parts: [{ text: prompt }],
                    },
                ],
            });

            const result = await chatSession.sendMessage("INSERT_INPUT_HERE");
            const tripPlanText = await result.response.text();

            try {
                const parsedTripPlan = JSON.parse(tripPlanText); 
                setTripPlan(parsedTripPlan);
                setLoading(false);
                console.log(parsedTripPlan);

            } catch (parseError) {
                console.error("Error parsing trip plan JSON:", parseError);
                setTripPlan(null); 
            }

            
        } catch (error) {
            console.error("Error generating trip plan:", error);
        }
    };

    const renderHotels = (hotels) => {
        return hotels.map((hotel, index) => (
            <div key={index} className="border p-4 rounded mb-4 flex-1 max-w-[350px] shadow-md">
                <h3 className="font-bold pb-2">{hotel.name}</h3>
                <div className="flex justify-between pb-2">
                    <p><span className="font-semibold">Price: </span>{hotel.price}</p>
                    <p className="flex items-center"><FaRegStar className="text-[#FFD43D]" /> {hotel.rating}</p>
                </div>
                <p className="pb-2">{hotel.address}</p>
                <p className="pb-2">{hotel.description}</p>
            </div>
        ));
    };

    const renderItinerary = (itinerary) => {
        return itinerary.map((dayPlan, index) => (
            <div key={index} className="flex justify-center items-stretch shadow-md">
                <div className="p-4 rounded mb-4 flex-1 max-w-[350px] h-full flex flex-col justify-center "> 
                    <h4 className="font-bold">Day {dayPlan.day}</h4>
                    {dayPlan.plan.map((activity, activityIndex) => (
                        <div key={activityIndex} className=""> 
                            <h5 className="font-semibold">{activity.place}</h5>
                            <p>{activity.details}</p>
                            <p className="font-medium">Ticket Pricing: <span className="font-light">{activity.ticketPricing}</span></p>
                            <p className="font-medium">Time: <span className="font-light">{activity.timeToTravel}</span></p>
                            <hr className="mt-2" />
                        </div>
                    ))}
                </div>
            </div>
        ));
    };
    
    


    return (
        <div>
            <div className="flex flex-col lg:flex-row justify-between px-6 lg:px-[10%] pt-[4%]">
                <div className="lg:pt-[7%] w-full lg:w-[45%] text-center lg:text-left">
                    <div className="font-semibold text-lg lg:text-xl mb-2">
                        DISCOVER THE NATURE AGAIN
                    </div>
                    <div className="pb-4 text-4xl lg:text-[500%] font-bold relative z-10 leading-tight">
                        In <span className="text-[#FFD43D]">pursuit</span> of new adventure
                    </div>
                    <div className="font-medium text-md lg:text-lg mb-6">
                        Find the best places to stay.
                    </div>

                    <div className="bg-[#201d34] flex flex-col lg:flex-row justify-center items-center p-6 relative z-10 rounded-xl mx-auto w-full lg:w-[100%]">
                        <form onSubmit={handleSubmit} className="flex flex-col lg:flex-row w-full justify-between text-white items-center">
                            <div className="w-full lg:w-[45%]">
                                <div className="flex items-center mb-4">
                                    <img
                                        src="/location.svg"
                                        className="w-[30px] hidden lg:block md:block"
                                        alt="Location icon"
                                    />
                                    <input
                                        className="ml-2 w-full p-2 bg-transparent border-b-2 border-gray-600 focus:outline-none"
                                        type="text"
                                        placeholder="Enter location"
                                        value={location}
                                        onChange={handleLocationChange}
                                    />
                                </div>
                                {suggestions.length > 0 && (
                                    <ul className="bg-white text-black rounded-md max-h-40 overflow-auto no-scrollbar">
                                        {suggestions.map((suggestion) => (
                                            <li
                                                key={suggestion.place_id}
                                                onClick={() => handleSuggestionSelect(suggestion)}
                                                className="p-2 hover:bg-[#FFD43D] hover:text-white cursor-pointer "
                                            >
                                                {suggestion.display_name}
                                            </li>
                                        ))}
                                    </ul>
                                )}
                                <div className="flex items-center">
                                    <img
                                        src="/days.svg"
                                        className="w-[30px] hidden lg:block md:block"
                                        alt="Days icon"
                                    />
                                    <input
                                        className="ml-2 w-full p-2 bg-transparent border-b-2 border-gray-600 focus:outline-none"
                                        type="number"
                                        placeholder="Number of days"
                                        value={days}
                                        onChange={(e) => setDays(e.target.value)}
                                    />
                                </div>
                            </div>

                            <div className="w-full lg:w-[45%] mt-4 lg:mt-0">
                                <div className="flex items-center mb-4">
                                    <img
                                        src="/budget.svg"
                                        className="w-[30px] hidden lg:block md:block"
                                        alt="Budget icon"
                                    />
                                    <Select value={budget} onValueChange={(value) => setBudget(value)}>
                                        <SelectTrigger className="ml-2 w-full p-2 bg-transparent border-b-1 border-gray-600 focus:outline-none">
                                            <SelectValue placeholder="Select budget" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="low">Low</SelectItem>
                                            <SelectItem value="medium">Medium</SelectItem>
                                            <SelectItem value="high">High</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="flex items-center">
                                    <img
                                        src="/travel.svg"
                                        className="hidden lg:block md:block w-[30px]"
                                        alt="Travel icon"
                                    />
                                    <Select value={people} onValueChange={(value) => setPeople(value)}>
                                        <SelectTrigger className="ml-2 w-full p-2 bg-transparent border-b-1 border-gray-600 focus:outline-none">
                                            <SelectValue placeholder="Travel partner" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Just Me">Just Me</SelectItem>
                                            <SelectItem value="Couple">Couple</SelectItem>
                                            <SelectItem value="Family">Family</SelectItem>
                                            <SelectItem value="Friends">Friends</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                            <Button type="submit" className="bg-[#FFD43D] hover:bg-[#ffea9d] hover:text-slate-400 lg:py-[7.5%] lg:ml-3 lg:mt-0 lg:w-auto mt-3 w-full">Generate</Button>
                        </form>
                    </div>
                </div>
                <div className="relative w-full lg:w-[50%] mt-8 lg:mt-0">
                    <img
                        src="/blob.svg"
                        className="absolute top-[0%] left-[0%] w-[80vw] h-[80vw] max-w-[700px] max-h-[700px] z-0"
                        alt="Blob background"
                    />
                    <img
                        src="/heroimg.png"
                        className="relative z-10 w-full max-w-[800px]"
                        alt="Hero"
                    />
                </div>
            </div>

            <div className="flex justify-center">
            <div className="py-6 lg:px-[10%]">
                <h2 className="text-3xl font-bold mb-6">Your Custom Trip Plan</h2>

                {loading ? (
                    

                    <div class="flex items-center justify-center ">
                        <div class="px-3 py-1 text-xs font-medium leading-none text-center text-blue-800 bg-blue-200 rounded-full animate-pulse dark:bg-blue-900 dark:text-blue-200">loading...</div>
                    </div>

                ) : tripPlan ? (
                    <div>
                        <h3 className="text-2xl font-bold mb-4">Hotels</h3>
                        <div className="">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
                                {tripPlan.hotels ? renderHotels(tripPlan.hotels) : <p>No hotel details available.</p>}
                            </div>
                        </div>
                        

                        <h3 className="text-2xl font-bold mt-8 mb-4">Itinerary</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            {tripPlan.itinerary ? renderItinerary(tripPlan.itinerary) : <p>No itinerary details available.</p>}
                        </div>
                    </div>
                ) : (
                    <p></p>
                )}
            </div>
            </div>
        </div>
    );
}
