import { useEffect, useState } from "react";
import { fetchAssets } from "../../api/cloudinary";
import type { AssetsPayload } from "../../api/cloudinary";

interface State {
    data?: AssetsPayload;
    loading: boolean;
    error?: Error;
}

/** Loads the Cloudinary asset list once; every component using it shares the same request. */
export function useCloudinaryAssets(): State {
    const [state, setState] = useState<State>({ loading: true });

    useEffect(() => {
        let alive = true;
        fetchAssets()
            .then((data) => alive && setState({ data, loading: false }))
            .catch((error: Error) => alive && setState({ loading: false, error }));
        return () => {
            alive = false;
        };
    }, []);

    return state;
}