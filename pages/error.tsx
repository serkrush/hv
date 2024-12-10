import ErrorPage from "next/error";

export default function Base({ statusCode = 404 }) {
    return <ErrorPage statusCode={statusCode} />;
}
