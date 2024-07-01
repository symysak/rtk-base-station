//@ts-check

import React from 'react';
import {
    Masthead,
    MastheadBrand,
    MastheadContent,
    MastheadMain,
    MastheadToggle,
    Nav,
    NavGroup,
    NavItem,
    NavList,
    Page,
    PageSidebar,
    PageSidebarBody,
    PageToggleButton,
    Toolbar,
    ToolbarContent
} from "@patternfly/react-core";
import BarsIcon from '@patternfly/react-icons/dist/esm/icons/bars-icon';
import { Link } from 'react-router-dom';
import './cockpit/pkg/lib/cockpit-dark-theme';

function Layout(props) {
    const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);

    
    const onSidebarToggle = () => {
        setIsSidebarOpen(!isSidebarOpen);
    };

    const headerToolbar = (
        <Toolbar id="vertical-toolbar">
            <ToolbarContent>
                RTK-GNSS基準局 設定画面
            </ToolbarContent>
        </Toolbar>
    );

    const header = (
        <Masthead>
            <MastheadToggle>
                <PageToggleButton
                    variant="plain"
                    aria-label="Global navigation"
                    isSidebarOpen={isSidebarOpen}
                    onSidebarToggle={onSidebarToggle}
                    id="vertical-nav-toggle"
                >
                    <BarsIcon />
                </PageToggleButton>
            </MastheadToggle>
            <MastheadContent>{headerToolbar}</MastheadContent>
        </Masthead>
    );

    const sidebar = (
        <PageSidebar isSidebarOpen={isSidebarOpen} id="vertical-sidebar">
            <PageSidebarBody>
                <Nav aria-label="Nav">
                    <NavList>
                        <NavItem>
                            <Link to="/">ホーム画面</Link>
                        </NavItem>
                        <NavItem>
                            <Link to="/easy-settings">簡単設定</Link>
                        </NavItem>
                        <NavItem>
                            <Link to="/test-page">試験的実装用</Link>
                        </NavItem>
                    </NavList>
                    <NavGroup
                        title="受信機設定"
                    >
                        <NavItem>
                            <Link to="/satelite">使用する衛星</Link>
                        </NavItem>
                    </NavGroup>
                </Nav>
            </PageSidebarBody>
        </PageSidebar>
    );
    return (
        <Page header={header} sidebar={sidebar}>
            {props.children}
        </Page>
    );
}
export default Layout;