export const getLatLng = async (address, city, state) => {
    const updatedAddress = address.replaceAll(" ", "%20") ?? "";
    const updatedCity = city?.replaceAll(" ", "%20") ?? "";
    const updatedWholeAddress = `${updatedAddress}%20${updatedCity}%20${state}`;
    if (!updatedWholeAddress) {
        throw new Error("Please provide an address");
    }
    const res = await fetch(`https://maps.googleapis.com/maps/api/geocode/json?address=${updatedWholeAddress}&key=${process.env.VITE_GOOGLE_MAPS_API_KEY}`);
    const data = await res.json().then((data) => {
        return data;
    });
    const { lat, lng } = data.results[0].geometry.location;
    return { lat, lng };
};
export const getLatLngFromZipcode = async (zipcode) => {
    const res = await fetch(`https://maps.googleapis.com/maps/api/geocode/json?address=${zipcode}&key=${process.env.VITE_GOOGLE_MAPS_API_KEY}`);
    const data = await res.json().then((data) => {
        return data;
    });
    const { location, bounds } = data.results[0].geometry;
    return { location, bounds };
};
