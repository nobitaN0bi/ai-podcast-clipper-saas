
import { VideoEditorMarvel } from "~/components/editor";

interface EditorPageProps {
    params: {
        videoId: string;
    };
}

export default function ProjectEditorPage({ params }: EditorPageProps) {
    // In the future, we pass params.videoId to VideoEditorMarvel to load specific project
    return <VideoEditorMarvel />;
}
