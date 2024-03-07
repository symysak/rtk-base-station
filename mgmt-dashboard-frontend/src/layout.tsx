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
    Page,
    PageSidebar,
    PageSidebarBody,
    PageToggleButton,
    Toolbar,
    ToolbarContent
} from "@patternfly/react-core";
import BarsIcon from '@patternfly/react-icons/dist/esm/icons/bars-icon';

type LayoutProps = {
    children: React.ReactNode;
};

function Layout(props: LayoutProps) {
    const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);
    const [activeItem, setActiveItem] = React.useState('group-1_item-1');
    
    const onSelect = (_event: React.FormEvent<HTMLInputElement>, result: { itemId: number | string }) => {
        setActiveItem(result.itemId as string);
      };
    
    const onSidebarToggle = () => {
        setIsSidebarOpen(!isSidebarOpen);
    };

    const headerToolbar = (
        <Toolbar id="vertical-toolbar">
            <ToolbarContent>
                {/* <ToolbarItem> </ToolbarItem> */}
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
            <MastheadMain>
                <MastheadBrand>RTK-GNSS基準局 設定画面</MastheadBrand>
            </MastheadMain>
            <MastheadContent>{headerToolbar}</MastheadContent>
        </Masthead>
    );

    const sidebar = (
        <PageSidebar isSidebarOpen={isSidebarOpen} id="vertical-sidebar">
            <PageSidebarBody>
                <Nav onSelect={onSelect} aria-label="Nav">
                    <NavGroup
                        title="受信機設定"
                    >
                        <NavItem
                            preventDefault
                            to="#nav-group1-item1"
                            itemId="group-1_item-1"
                            isActive={activeItem === 'group-1_item-1'}
                        >
                            使用する衛星
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