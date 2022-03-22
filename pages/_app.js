import App from "next/app";
import { AppProvider } from "@shopify/polaris";
import { Provider, useAppBridge } from "@shopify/app-bridge-react";
import { authenticatedFetch } from "@shopify/app-bridge-utils";
import { Redirect } from "@shopify/app-bridge/actions";
import "@shopify/polaris/dist/styles.css";
import { ApolloClient, InMemoryCache, ApolloProvider } from "@apollo/client";

const apolloClient = new ApolloClient({
  uri: "https://48p1r2roz4.sse.codesandbox.io",
  cache: new InMemoryCache(),
});

function userLoggedInFetch(app) {
  const fetchFunction = authenticatedFetch(app);

  return async (uri, options) => {
    const response = await fetchFunction(uri, options);

    if (
      response.headers.get("X-Shopify-API-Request-Failure-Reauthorize") === "1"
    ) {
      const authUrlHeader = response.headers.get(
        "X-Shopify-API-Request-Failure-Reauthorize-Url"
      );

      const redirect = Redirect.create(app);
      redirect.dispatch(Redirect.Action.APP, authUrlHeader || `/auth`);
      return null;
    }

    return response;
  };
}

function MyProvider(props) {
  const Component = props.Component;

  return <Component {...props} />;
}

class MyApp extends App {
  render() {
    const { Component, pageProps, host } = this.props;
    return (
      <ApolloProvider client={apolloClient}>
        <Provider
          config={{
            apiKey: API_KEY,
            host: host,
            forceRedirect: true,
          }}
        >
          <MyProvider Component={Component} {...pageProps} />
        </Provider>
      </ApolloProvider>
    );
  }
}

MyApp.getInitialProps = async ({ ctx }) => {
  return {
    host: ctx.query.host,
  };
};

export default MyApp;
