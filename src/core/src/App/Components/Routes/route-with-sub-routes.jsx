import React from 'react';
import { Redirect, Route } from 'react-router-dom';
import { removeBranchName, routes, isEmptyObject, default_title } from '@deriv/shared';
import Page404 from 'Modules/Page404';
import { observer, useStore } from '@deriv/stores';

const RouteWithSubRoutes = observer(route => {
    const { common } = useStore();

    const { checkAppId } = common;

    const validateRoute = () => {
        return true;
    };

    const renderFactory = props => {
        let result = null;
        const pathname = removeBranchName(location.pathname).replace(/\/$/, '');
        const is_valid_route = validateRoute(pathname);

        // check if by re-rendering content should Platform app_id  change or not,
        if (is_valid_route) {
            checkAppId();
        }

        if (route.component === Redirect) {
            let to = route.to;

            // This if clause has been added just to remove '/index' from url in localhost env.
            if (route.path === routes.index) {
                const { location } = props;
                to = location.pathname.toLowerCase().replace(route.path, '');
            }
            result = <Redirect to={to} />;
        } else {
            const default_subroute = route.routes ? route.routes.find(r => r.default) : {};
            const has_default_subroute = !isEmptyObject(default_subroute);

            result = (
                <React.Fragment>
                    {has_default_subroute && pathname === route.path && <Redirect to={default_subroute.path} />}
                    {is_valid_route ? (
                        <route.component {...props} routes={route.routes} passthrough={route.passthrough} />
                    ) : (
                        <Page404 />
                    )}
                </React.Fragment>
            );
        }

        const title = route.getTitle?.() || '';
        document.title = `${title} | ${default_title}`;

        return result;
    };

    return <Route exact={route.exact} path={route.path} render={renderFactory} />;
});

export default RouteWithSubRoutes;
